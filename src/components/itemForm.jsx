import React, { useState } from "react";
import {
    Upload,
    X,
    Image as ImageIcon,
    Loader2,
    Plus,
    Check,
    DollarSign,
    AlignLeft,
    Tag,
    Type,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTemplate } from "../contexts/TemplateContext"; // Import Theme Context

const DEFAULT_CATEGORIES = ["food", "drink", "snack", "dessert", "other"];

export function ItemForm({
    item,
    onSave,
    onCancel,
    onUploadPhoto,
    customCategories = [],
    addCustomCategory,
}) {
    const { t } = useLanguage();
    const { theme } = useTemplate(); // Ambil tema dinamis

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
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState("");

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
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];

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
                setUploadError(
                    err.message || "Upload gagal. Silakan coba lagi."
                );
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
        if (!trimmed || trimmed.length < 2 || trimmed.length > 20) return;

        if (addCustomCategory) {
            const success = addCustomCategory(trimmed);
            if (success) {
                handleChange("category", trimmed);
                setNewCategory("");
                setShowCategoryInput(false);
            }
        } else {
            handleChange("category", trimmed);
            setNewCategory("");
            setShowCategoryInput(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
        if (!form.price || Number(form.price) <= 0)
            newErrors.price = "Harga harus valid";
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

    // Style Helper untuk Input yang Fokus
    const focusStyle = {
        borderColor: theme?.primary || "#3b82f6",
        boxShadow: `0 0 0 4px ${theme?.primary}1A`, // 10% opacity color
    };

    return (
        <div className="space-y-5">
            {/* 1. PHOTO UPLOAD SECTION */}
            <div className="flex justify-center">
                {form.photo ? (
                    <div className="relative group">
                        <img
                            src={form.photo}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-2xl shadow-sm border border-gray-100"
                            onError={(e) => {
                                e.target.src =
                                    "https://placehold.co/400x300?text=Error";
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105"
                            >
                                Hapus Foto
                            </button>
                        </div>
                    </div>
                ) : (
                    <label
                        className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                            uploading
                                ? "bg-gray-50 opacity-50"
                                : "hover:bg-gray-50 hover:border-gray-400"
                        }`}
                        style={{
                            borderColor: uploading ? "#e5e7eb" : undefined,
                        }}
                    >
                        {uploading ? (
                            <>
                                <Loader2
                                    size={32}
                                    className="animate-spin text-gray-400 mb-2"
                                />
                                <span className="text-sm text-gray-500">
                                    Mengupload...
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <Upload
                                        size={24}
                                        className="text-gray-500"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    Klik untuk upload foto
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    JPG, PNG, WEBP (Max 5MB)
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                )}
                {uploadError && (
                    <p className="text-red-500 text-xs mt-2 text-center">
                        {uploadError}
                    </p>
                )}
            </div>

            {/* 2. FORM FIELDS */}
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                        {t.name}
                    </label>
                    <div className="relative">
                        <Type
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${
                                errors.name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200 bg-gray-50 focus:bg-white"
                            }`}
                            style={{
                                ...(errors.name
                                    ? {}
                                    : { ":focus": focusStyle }),
                            }} // Note: inline focus style is tricky, relies on class logic usually.
                            // Simple workaround for focus color:
                            onFocus={(e) =>
                                (e.target.style.borderColor = theme?.primary)
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = errors.name
                                    ? "#ef4444"
                                    : "#e5e7eb")
                            }
                            placeholder="Contoh: Nasi Goreng Spesial"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1 ml-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Price & Category Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                            {t.price}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    handleChange("price", e.target.value)
                                }
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${
                                    errors.price
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-200 bg-gray-50 focus:bg-white"
                                }`}
                                onFocus={(e) =>
                                    (e.target.style.borderColor =
                                        theme?.primary)
                                }
                                onBlur={(e) =>
                                    (e.target.style.borderColor = errors.price
                                        ? "#ef4444"
                                        : "#e5e7eb")
                                }
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                            {t.category}
                        </label>
                        <div className="relative">
                            <Tag
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    handleChange("category", e.target.value)
                                }
                                className="w-full pl-10 pr-8 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none appearance-none cursor-pointer focus:bg-white transition-all"
                                onFocus={(e) =>
                                    (e.target.style.borderColor =
                                        theme?.primary)
                                }
                                onBlur={(e) =>
                                    (e.target.style.borderColor = "#e5e7eb")
                                }
                            >
                                {allCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {t[cat] ||
                                            cat.charAt(0).toUpperCase() +
                                                cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {/* Add Category Button (Small) */}
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCategoryInput(!showCategoryInput)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md text-gray-500"
                                title="Tambah Kategori"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* New Category Input */}
                {showCategoryInput && (
                    <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex gap-2 animate-fadeIn">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nama kategori baru..."
                            className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            disabled={!newCategory.trim()}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
                        >
                            <Check size={16} />
                        </button>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                        {t.description}
                    </label>
                    <div className="relative">
                        <AlignLeft
                            size={18}
                            className="absolute left-3 top-4 text-gray-400"
                        />
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                            rows={3}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:bg-white resize-none transition-all"
                            onFocus={(e) =>
                                (e.target.style.borderColor = theme?.primary)
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#e5e7eb")
                            }
                            placeholder="Jelaskan detail menu ini..."
                        />
                    </div>
                </div>
            </div>

            {/* 3. ACTION BUTTONS */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                    {t.cancel}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 px-4 py-3 text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                    style={{ background: theme?.buttonBg || "#666fb8" }}
                >
                    {uploading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Check size={20} />
                    )}
                    {uploading ? "Processing..." : t.save}
                </button>
            </div>
        </div>
    );
}

export default ItemForm;
