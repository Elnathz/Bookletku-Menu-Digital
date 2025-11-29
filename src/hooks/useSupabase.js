import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";
const STORAGE_BUCKET = "bookletku";

export function useSupabase() {
    const [items, setItems] = useState([]);
    const [settings, setSettingsState] = useState(null);
    const [customCategories, setCustomCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSupabaseError = async (error) => {
        console.error("Supabase Operation Error:", error);
        if (error?.message?.includes("JWT") || error?.code === "PGRST301") {
            const { data, error: refreshError } =
                await supabase.auth.refreshSession();
            if (refreshError || !data.session) {
                window.location.href = "/login";
                return false;
            }
            return true;
        }
        return false;
    };

    const fetchItems = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("store_id", DEFAULT_STORE_ID)
                .order("sort_order", { ascending: true });

            if (error) throw error;

            const transformed = (data || []).map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description || "",
                category: item.category || "food",
                photo: item.photo || "",
                views: item.views || 0,
                order: item.sort_order || 0,
                badge: item.badge_text || "", // <--- Mapping kolom badge_text
            }));

            setItems(transformed);

            const defaultCategories = [
                "food",
                "drink",
                "snack",
                "dessert",
                "other",
            ];
            const allCats = [...new Set(transformed.map((i) => i.category))];
            setCustomCategories(
                allCats.filter((c) => !defaultCategories.includes(c))
            );

            return transformed;
        } catch (err) {
            handleSupabaseError(err);
            return [];
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("stores")
                .select("*")
                .eq("id", DEFAULT_STORE_ID)
                .single();

            if (error) throw error;

            if (data) {
                setSettingsState({
                    storeName: data.name,
                    storeLocation: data.store_location || "",
                    operatingHours: data.operating_hours || "",
                    whatsappNumber: data.whatsapp_number,
                });
            }
        } catch (err) {
            handleSupabaseError(err);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchItems(), fetchSettings()]);
            if (mounted) setLoading(false);
        };
        init();

        const channel = supabase
            .channel("db_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "menu_items" },
                () => fetchItems()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "stores" },
                () => fetchSettings()
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    // --- CRUD Actions ---

    const addItem = async (itemData) => {
        try {
            const { data, error } = await supabase
                .from("menu_items")
                .insert({
                    store_id: DEFAULT_STORE_ID,
                    name: itemData.name,
                    price: itemData.price,
                    description: itemData.description || "",
                    category: itemData.category || "food",
                    photo: itemData.photo || "",
                    badge_text: itemData.badge || null, // <--- Simpan Badge
                    views: 0,
                    sort_order: items.length,
                })
                .select()
                .single();

            if (error) throw error;
            await fetchItems();
            return data;
        } catch (err) {
            const refreshed = await handleSupabaseError(err);
            if (refreshed) alert("Sesi diperbarui. Silakan coba simpan lagi.");
            throw err;
        }
    };

    const updateItem = async (id, itemData) => {
        try {
            const { error } = await supabase
                .from("menu_items")
                .update({
                    name: itemData.name,
                    price: itemData.price,
                    description: itemData.description || "",
                    category: itemData.category,
                    photo: itemData.photo,
                    badge_text: itemData.badge || null, // <--- Update Badge
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) throw error;
            await fetchItems();
        } catch (err) {
            await handleSupabaseError(err);
            throw err;
        }
    };

    const deleteItem = async (id) => {
        try {
            await supabase.from("menu_items").delete().eq("id", id);
            await fetchItems();
        } catch (err) {
            await handleSupabaseError(err);
            throw err;
        }
    };

    const reorderItems = async (newItems) => {
        // 1. Update Tampilan UI (Optimistic) LANGSUNG
        setItems(newItems);

        try {
            // 2. Kirim update ke server (Background)
            // Update sort_order berdasarkan index baru di array
            const promises = newItems.map((item, index) =>
                supabase
                    .from("menu_items")
                    .update({
                        sort_order: index, // Kunci utamanya di sini: Index array = Urutan DB
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", item.id)
            );

            await Promise.all(promises);
        } catch (err) {
            console.error("❌ Reorder error:", err);
            await fetchItems(); // Revert jika gagal
        }
    };

    const uploadPhoto = async (file) => {
        try {
            const ext = file.name.split(".").pop();
            const fileName = `menu-${Date.now()}.${ext}`;
            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);
            return { url: data.publicUrl };
        } catch (err) {
            await handleSupabaseError(err);
            throw err;
        }
    };

    const uploadAvatar = async (file, userId) => {
        try {
            const ext = file.name.split(".").pop();
            const fileName = `avatars/${userId}/${Date.now()}.${ext}`;
            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, {
                    upsert: true,
                    contentType: file.type,
                    cacheControl: "3600",
                });
            if (error) throw error;
            const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);
            const { error: updateError } = await supabase
                .from("user_profiles")
                .update({
                    avatar_url: data.publicUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
            if (updateError) throw updateError;
            return { url: data.publicUrl };
        } catch (err) {
            await handleSupabaseError(err);
            throw err;
        }
    };

    const setSettings = async (s) => {
        try {
            const { error } = await supabase
                .from("stores")
                .update({
                    name: s.storeName,
                    store_location: s.storeLocation,
                    operating_hours: s.operatingHours,
                    whatsapp_number: s.whatsappNumber,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", DEFAULT_STORE_ID);
            if (error) throw error;
            setSettingsState(s);
        } catch (err) {
            const refreshed = await handleSupabaseError(err);
            if (refreshed)
                alert("Koneksi diperbarui. Silakan tekan Simpan lagi.");
            else alert("Gagal menyimpan. Pastikan Anda login.");
            throw err;
        }
    };

    return {
        items,
        settings: settings || {},
        customCategories,
        loading,
        addItem,
        updateItem,
        deleteItem,
        reorderItems,
        uploadPhoto,
        uploadAvatar,
        setSettings,
        refetch: fetchItems,
    };
}

export default useSupabase;
