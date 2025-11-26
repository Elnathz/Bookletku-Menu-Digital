import React, { useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const DEFAULT_CATEGORIES = ["food", "drink", "snack", "dessert", "other"];

export function ItemForm({
  item,
  onSave,
  onCancel,
  onUploadPhoto,
  customCategories = [],
}) {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price || "",
    description: item?.description || "",
    category: item?.category || "food",
    photo: item?.photo || "",
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState("");

  // Custom category states
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // Combine default and custom categories
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    if (onUploadPhoto) {
      setUploading(true);
      try {
        const result = await onUploadPhoto(file);
        setForm((prev) => ({ ...prev, photo: result.url }));
        setUploadError("");
      } catch (err) {
        setUploadError(err.message || "Upload gagal. Silakan coba lagi.");
      } finally {
        setUploading(false);
      }
    }

    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo: "" }));
    setUploadError("");
  };

  const handleAddCustomCategory = () => {
    const trimmed = newCategory.trim().toLowerCase();

    if (!trimmed) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    if (trimmed.length < 2) {
      alert("Nama kategori minimal 2 karakter");
      return;
    }

    if (trimmed.length > 20) {
      alert("Nama kategori maksimal 20 karakter");
      return;
    }

    if (allCategories.includes(trimmed)) {
      alert("Kategori sudah ada");
      return;
    }

    // Validate format (only letters, numbers, space, dash)
    if (!/^[a-z0-9\s-]+$/.test(trimmed)) {
      alert(
        "Kategori hanya boleh berisi huruf, angka, spasi, dan tanda hubung"
      );
      return;
    }

    setAddingCategory(true);

    // Add to custom categories via parent component
    // The parent should handle saving to database/localStorage
    handleChange("category", trimmed);

    // Reset
    setNewCategory("");
    setShowCategoryInput(false);
    setAddingCategory(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!form.price || Number(form.price) <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      category: form.category,
      photo: form.photo,
    });
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.name} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Contoh: Nasi Goreng Spesial"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.price} (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.price ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          placeholder="25000"
          min="0"
        />
        {errors.price && (
          <p className="text-red-500 text-xs mt-1">{errors.price}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.description}
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
          placeholder="Deskripsi singkat menu..."
        />
      </div>

      {/* Category - WITH CUSTOM OPTION */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.category}
        </label>

        {/* Category Select */}
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {t[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Add Custom Category Button */}
          <button
            type="button"
            onClick={() => setShowCategoryInput(!showCategoryInput)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Tambah kategori baru"
          >
            <Plus size={18} className={showCategoryInput ? "rotate-45" : ""} />
          </button>
        </div>

        {/* Custom Category Input */}
        {showCategoryInput && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-xs text-blue-700 font-medium">
              Tambah Kategori Baru
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
                placeholder="Nama kategori (contoh: seafood)"
                className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                disabled={addingCategory}
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                disabled={!newCategory.trim() || addingCategory}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryInput(false);
                  setNewCategory("");
                }}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Huruf kecil, angka, spasi, dan tanda hubung. Min 2, max 20
              karakter.
            </p>
          </div>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.photo}
        </label>

        {form.photo && (
          <div className="relative inline-block mb-3">
            <img
              src={form.photo}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border shadow-sm"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/128?text=Error";
              }}
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {!form.photo && (
          <label
            className={`
                            flex flex-col items-center justify-center 
                            w-full h-32 
                            border-2 border-dashed border-gray-300 rounded-lg 
                            cursor-pointer 
                            hover:bg-gray-50 hover:border-blue-400
                            transition-all
                            ${
                              uploading
                                ? "opacity-50 pointer-events-none bg-gray-50"
                                : ""
                            }
                        `}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2
                  size={32}
                  className="text-blue-500 animate-spin mb-2"
                />
                <span className="text-sm text-gray-500">Mengupload...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">
                  Klik untuk upload foto
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF, WebP (max 5MB)
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}

        {uploadError && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <X size={12} />
            {uploadError}
          </p>
        )}

        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Atau masukkan URL foto:</p>
          <input
            type="text"
            value={form.photo}
            onChange={(e) => handleChange("photo", e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          {t.cancel}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className={`
                        flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium transition-colors
                        ${
                          uploading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-blue-700"
                        }
                    `}
        >
          {uploading ? "Mengupload..." : t.save}
        </button>
      </div>
    </div>
  );
}

export default ItemForm;
