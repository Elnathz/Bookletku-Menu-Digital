import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../config/supabase";

// ID TOKO (Harus sama dengan Database)
const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";
const STORAGE_BUCKET = "bookletku";

export function useSupabase() {
    const [items, setItems] = useState([]);
    const [settings, setSettingsState] = useState(null);
    const [customCategories, setCustomCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ref untuk mencegah bentrok
    const isReordering = useRef(false);
    const isRetrying = useRef(false); // Flag untuk mencegah infinite loop

    // --- FUNGSI FETCH MENU (DENGAN SMART RETRY) ---
    const fetchItems = useCallback(async (retryCount = 0) => {
        if (isReordering.current) return;

        try {
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .eq("store_id", DEFAULT_STORE_ID)
                .order("sort_order", { ascending: true });

            if (error) throw error;

            // Jika berhasil, mapping data
            const transformed = (data || []).map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description || "",
                category: item.category || "food",
                photo: item.photo || "",
                views: item.views || 0,
                order: item.sort_order || 0,
                badge: item.badge_text || "",
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
            console.error("Fetch Error:", err.message);

            // --- LOGIKA PENYELAMAT (SMART RETRY) ---
            // Jika error karena Token/JWT dan belum retry > 1 kali
            if (
                (err.message?.includes("JWT") ||
                    err.code === "PGRST301" ||
                    err.code === "401") &&
                retryCount < 2
            ) {
                console.log("Token bermasalah, mencoba memulihkan...");

                // Langkah 1: Coba Refresh Token (Agar Admin tetap login)
                const { data: sessionData, error: refreshErr } =
                    await supabase.auth.refreshSession();

                if (!refreshErr && sessionData.session) {
                    console.log(
                        "Token berhasil direfresh. Mengambil ulang data..."
                    );
                    return await fetchItems(retryCount + 1); // Coba lagi
                } else {
                    console.log("Token mati total. Beralih ke mode Tamu...");
                    // Langkah 2: Token sudah tidak bisa diselamatkan. Buang token rusak.
                    await supabase.auth.signOut();
                    return await fetchItems(retryCount + 1); // Coba lagi sebagai Tamu
                }
            }
            return [];
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const { data } = await supabase
                .from("stores")
                .select("*")
                .eq("id", DEFAULT_STORE_ID)
                .single();

            if (data) {
                setSettingsState({
                    storeName: data.name,
                    storeLocation: data.store_location || "",
                    operatingHours: data.operating_hours || "",
                    whatsappNumber: data.whatsapp_number,
                });
            }
        } catch (err) {
            console.error("Settings Error:", err);
        }
    }, []);

    // --- INIT ---
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchItems(), fetchSettings()]);
            if (mounted) setLoading(false);
        };
        init();

        // Subscribe Realtime
        const channel = supabase
            .channel("public_changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "menu_items" },
                () => {
                    if (!isReordering.current) fetchItems();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "stores" },
                () => fetchSettings()
            )
            .subscribe();

        // Subscribe Auth Change (Penting agar saat token refresh, data ke-load)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "SIGNED_OUT"
            ) {
                fetchItems();
                fetchSettings();
            }
        });

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
            subscription.unsubscribe();
        };
    }, []);

    // --- CRUD ---
    const addItem = async (itemData) => {
        const { data, error } = await supabase
            .from("menu_items")
            .insert({
                store_id: DEFAULT_STORE_ID,
                name: itemData.name,
                price: itemData.price,
                description: itemData.description,
                category: itemData.category,
                photo: itemData.photo,
                badge_text: itemData.badge,
                sort_order: items.length,
            })
            .select()
            .single();
        if (error) throw error;
        await fetchItems();
        return data;
    };

    const updateItem = async (id, itemData) => {
        const { error } = await supabase
            .from("menu_items")
            .update({
                name: itemData.name,
                price: itemData.price,
                description: itemData.description,
                category: itemData.category,
                photo: itemData.photo,
                badge_text: itemData.badge,
                updated_at: new Date(),
                ...(itemData.views !== undefined && { views: itemData.views }),
            })
            .eq("id", id);
        if (error) throw error;
        await fetchItems();
    };

    const deleteItem = async (id) => {
        await supabase.from("menu_items").delete().eq("id", id);
        await fetchItems();
    };

    const reorderItems = async (newItems) => {
        isReordering.current = true;
        setItems(newItems.map((item, index) => ({ ...item, order: index })));
        try {
            for (let i = 0; i < newItems.length; i++) {
                await supabase
                    .from("menu_items")
                    .update({ sort_order: i })
                    .eq("id", newItems[i].id);
            }
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => {
            isReordering.current = false;
        }, 1500);
    };

    const uploadPhoto = async (file) => {
        const fileName = `menu-${Date.now()}.${file.name.split(".").pop()}`;
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);
        return { url: data.publicUrl };
    };

    const uploadAvatar = async (file, userId) => {
        const fileName = `avatars/${userId}-${Date.now()}`;
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);
        await supabase
            .from("user_profiles")
            .update({ avatar_url: data.publicUrl })
            .eq("id", userId);
        return { url: data.publicUrl };
    };

    const setSettings = async (s) => {
        const { error } = await supabase
            .from("stores")
            .update({
                name: s.storeName,
                store_location: s.storeLocation,
                operating_hours: s.operatingHours,
                whatsapp_number: s.whatsappNumber,
            })
            .eq("id", DEFAULT_STORE_ID);
        if (error) throw error;
        setSettingsState(s);
    };

    const submitOrder = async (orderData, cartItems) => {
        const { data, error } = await supabase
            .from("orders")
            .insert({
                store_id: DEFAULT_STORE_ID,
                customer_name: orderData.customerName,
                items: cartItems,
                total_amount: orderData.totalAmount,
                notes: orderData.notes,
                order_type: orderData.orderType,
            })
            .select()
            .single();

        if (error) console.error("Order Error:", error);

        cartItems.forEach(async (item) => {
            const currentItem = items.find((i) => i.id === item.id);
            if (currentItem) {
                await supabase
                    .from("menu_items")
                    .update({ views: (currentItem.views || 0) + 1 })
                    .eq("id", item.id);
            }
        });
        return data;
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
        submitOrder,
        refetch: fetchItems,
    };
}

export default useSupabase;
