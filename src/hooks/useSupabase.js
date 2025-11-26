import { useState, useEffect, useCallback } from "react";
import { supabase, STORAGE_BUCKET, DEFAULT_STORE_ID } from "../config/supabase";

export function useSupabase() {
  const [items, setItems] = useState([]);
  const [settings, setSettingsState] = useState({
    storeName: "Warung Makan Berkah",
    whatsappNumber: "6285157680550",
  });
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH FUNCTIONS
  // ============================================

  const fetchItems = useCallback(async () => {
    try {
      console.log("📥 Fetching menu items...");

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("store_id", DEFAULT_STORE_ID)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("❌ Fetch items error:", error);
        throw error;
      }

      const transformedData = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || "",
        category: item.category || "food",
        photo: item.photo || "",
        views: item.views || 0,
        order: item.sort_order || 0,
      }));

      console.log("✅ Items fetched:", transformedData.length);
      setItems(transformedData);

      // Extract custom categories from items
      extractCustomCategories(transformedData);

      return transformedData;
    } catch (err) {
      console.error("❌ Error fetching items:", err);
      setError(err.message);
      return [];
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      console.log("📥 Fetching store settings...");

      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", DEFAULT_STORE_ID)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("🏪 Creating default store...");
          const { data: newStore, error: createError } = await supabase
            .from("stores")
            .insert({
              id: DEFAULT_STORE_ID,
              name: "My Store",
              whatsapp_number: "628123456789",
            })
            .select()
            .single();

          if (createError) throw createError;

          setSettingsState({
            storeName: newStore.name,
            whatsappNumber: newStore.whatsapp_number,
          });
          return;
        }
        throw error;
      }

      if (data) {
        console.log("✅ Settings fetched:", data.name);
        setSettingsState({
          storeName: data.name,
          whatsappNumber: data.whatsapp_number,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
    }
  }, []);

  // Extract custom categories from items
  const extractCustomCategories = (items) => {
    const defaultCategories = ["food", "drink", "snack", "dessert", "other"];
    const allCategories = [...new Set(items.map((item) => item.category))];
    const custom = allCategories.filter(
      (cat) => !defaultCategories.includes(cat)
    );

    console.log("📁 Custom categories found:", custom);
    setCustomCategories(custom);
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchSettings()]);
      setLoading(false);
    };
    initData();
  }, [fetchItems, fetchSettings]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const addItem = async (itemData) => {
    try {
      console.log("➕ Adding new item:", itemData.name);

      const newItem = {
        store_id: DEFAULT_STORE_ID,
        name: itemData.name,
        price: Number(itemData.price) || 0,
        description: itemData.description || "",
        category: itemData.category || "food",
        photo: itemData.photo || "",
        views: 0,
        sort_order: items.length,
      };

      const { data, error } = await supabase
        .from("menu_items")
        .insert(newItem)
        .select()
        .single();

      if (error) {
        console.error("❌ Add item error:", error);
        throw error;
      }

      console.log("✅ Item added:", data.id);

      const transformedItem = {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        photo: data.photo,
        views: data.views,
        order: data.sort_order,
      };

      setItems((prev) => {
        const newItems = [...prev, transformedItem];
        extractCustomCategories(newItems);
        return newItems;
      });

      return transformedItem;
    } catch (err) {
      console.error("❌ Error adding item:", err);
      throw err;
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      console.log("✏️ Updating item:", id);

      const updates = {
        name: itemData.name,
        price: Number(itemData.price) || 0,
        description: itemData.description || "",
        category: itemData.category || "food",
        photo: itemData.photo || "",
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Update item error:", error);
        throw error;
      }

      console.log("✅ Item updated:", data.id);

      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                name: data.name,
                price: data.price,
                description: data.description,
                category: data.category,
                photo: data.photo,
              }
            : item
        );
        extractCustomCategories(updated);
        return updated;
      });

      return data;
    } catch (err) {
      console.error("❌ Error updating item:", err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      console.log("🗑️ Deleting item:", id);

      const item = items.find((i) => i.id === id);

      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) {
        console.error("❌ Delete item error:", error);
        throw error;
      }

      if (item?.photo && item.photo.includes(STORAGE_BUCKET)) {
        try {
          const photoPath = item.photo.split(`${STORAGE_BUCKET}/`)[1];
          if (photoPath) {
            await supabase.storage.from(STORAGE_BUCKET).remove([photoPath]);
            console.log("🖼️ Photo deleted:", photoPath);
          }
        } catch (photoErr) {
          console.warn("⚠️ Could not delete photo:", photoErr);
        }
      }

      console.log("✅ Item deleted:", id);

      setItems((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        extractCustomCategories(filtered);
        return filtered;
      });
    } catch (err) {
      console.error("❌ Error deleting item:", err);
      throw err;
    }
  };

  const incrementViews = async (id) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const newViews = (item.views || 0) + 1;

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, views: newViews } : i))
      );

      await supabase
        .from("menu_items")
        .update({ views: newViews })
        .eq("id", id);
    } catch (err) {
      console.error("❌ Error incrementing views:", err);
    }
  };

  const reorderItems = async (newItems) => {
    try {
      console.log("🔄 Reordering items...");

      const reorderedItems = newItems.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      setItems(reorderedItems);

      const updates = newItems.map((item, index) =>
        supabase
          .from("menu_items")
          .update({ sort_order: index })
          .eq("id", item.id)
      );

      await Promise.all(updates);
      console.log("✅ Items reordered");
    } catch (err) {
      console.error("❌ Error reordering items:", err);
      await fetchItems();
    }
  };

  // ============================================
  // PHOTO UPLOAD
  // ============================================

  const uploadPhoto = async (file) => {
    try {
      console.log("📤 Uploading photo:", file.name);

      if (!file) throw new Error("No file provided");

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not allowed. Use JPG, PNG, GIF, or WebP.");
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File too large. Maximum 5MB.");
      }

      const fileExt = file.name.split(".").pop().toLowerCase();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const fileName = `menu-photos/${timestamp}-${randomStr}.${fileExt}`;

      console.log("📁 Uploading to:", fileName);

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Upload error:", error);
        throw error;
      }

      console.log("✅ Upload success:", data.path);

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      console.log("🔗 Public URL:", urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: fileName,
      };
    } catch (err) {
      console.error("❌ Error uploading photo:", err);
      throw err;
    }
  };

  const deletePhoto = async (photoUrl) => {
    try {
      if (!photoUrl || !photoUrl.includes(STORAGE_BUCKET)) return;

      const photoPath = photoUrl.split(`${STORAGE_BUCKET}/`)[1];
      if (!photoPath) return;

      console.log("🗑️ Deleting photo:", photoPath);

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([photoPath]);

      if (error) throw error;

      console.log("✅ Photo deleted");
    } catch (err) {
      console.error("❌ Error deleting photo:", err);
    }
  };

  // ============================================
  // STORE SETTINGS
  // ============================================

  const setSettings = async (newSettings) => {
    try {
      console.log("💾 Saving settings:", newSettings);

      const { error } = await supabase
        .from("stores")
        .update({
          name: newSettings.storeName,
          whatsapp_number: newSettings.whatsappNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", DEFAULT_STORE_ID);

      if (error) {
        console.error("❌ Update settings error:", error);
        throw error;
      }

      console.log("✅ Settings saved");
      setSettingsState(newSettings);
    } catch (err) {
      console.error("❌ Error updating settings:", err);
      throw err;
    }
  };

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    items,
    settings,
    customCategories, // NEW
    loading,
    error,

    // CRUD
    addItem,
    updateItem,
    deleteItem,
    incrementViews,
    reorderItems,

    // Photo
    uploadPhoto,
    deletePhoto,

    // Settings
    setSettings,

    // Refresh
    refetch: fetchItems,
  };
}

export default useSupabase;
