import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
    Upload,
    Check,
    Type,
    Tag,
    Star,
    ZoomIn,
    Loader2,
    Plus,
    X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTemplate } from "../contexts/TemplateContext";
import Modal from "./Modal";

// --- UTILITY: CROP IMAGE ---
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

async function getCroppedImg(imageSrc, pixelCrop, mimeType = "image/jpeg") {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(blob);
            },
            mimeType,
            0.9
        );
    });
}

const DEFAULT_CATEGORIES = ["food", "drink", "snack", "dessert", "other"];

// OPSI BADGE YANG BISA DIPILIH
const BADGE_OPTIONS = [
    {
        value: "",
        label: "Auto / None",
        desc: "Ikuti jumlah views",
        color: "bg-gray-100 text-gray-600 border-gray-200",
    },
    {
        value: "popular",
        label: "🔥 Popular",
        desc: "Favorit pelanggan",
        color: "bg-orange-100 text-orange-700 border-orange-200",
    },
    {
        value: "trending",
        label: "📈 Trending",
        desc: "Sedang naik daun",
        color: "bg-pink-100 text-pink-700 border-pink-200",
    },
    {
        value: "new",
        label: "✨ New",
        desc: "Menu baru",
        color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
        value: "bestseller",
        label: "👑 Best Seller",
        desc: "Paling laris",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    {
        value: "recommended",
        label: "👍 Recommended",
        desc: "Rekomendasi Chef",
        color: "bg-green-100 text-green-700 border-green-200",
    },
];

export function ItemForm({
    item,
    onSave,
    onCancel,
    onUploadPhoto,
    customCategories = [],
    addCustomCategory,
}) {
    const { t } = useLanguage();
    const { theme } = useTemplate();

    // --- FORM STATE ---
    const [form, setForm] = useState({
        name: item?.name || "",
        price: item?.price || "",
        description: item?.description || "",
        category: item?.category || "food",
        photo: item?.photo || "",
        badge: item?.badge || "", // Load badge dari database
    });

    const [errors, setErrors] = useState({});
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    // --- CROP STATE ---
    const [imageSrc, setImageSrc] = useState(null);
    const [imageType, setImageType] = useState("image/jpeg");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(4 / 3);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // 1. Handle File Select -> Buka Crop Modal
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            setUploadError("Format file tidak didukung (JPG, PNG, WEBP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Ukuran file maksimal 5MB.");
            return;
        }

        setImageType(file.type);
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImageSrc(reader.result);
            setShowCropModal(true);
            setUploadError("");
        });
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setUploading(true);
        try {
            const croppedBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                imageType
            );
            const ext = imageType.split("/")[1] || "jpg";
            const fileName = `menu-${Date.now()}.${ext}`;

            const fileToUpload = new File([croppedBlob], fileName, {
                type: imageType,
            });

            if (onUploadPhoto) {
                const result = await onUploadPhoto(fileToUpload);
                setForm((prev) => ({ ...prev, photo: result.url }));
            }

            setShowCropModal(false);
            setImageSrc(null);
            setZoom(1);
        } catch (err) {
            console.error(err);
            setUploadError("Gagal mengupload foto. Silakan coba lagi.");
        } finally {
            setUploading(false);
        }
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
            badge: form.badge, // <--- Ini yang menyimpan status badge ke database
        });
    };

    return (
        <div className="space-y-5">
            {/* PHOTO SECTION */}
            <div className="flex justify-center">
                {form.photo ? (
                    <div className="relative group w-full">
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
                                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all"
                            >
                                Hapus Foto
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group hover:bg-gray-50 hover:border-gray-400">
                        <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={24} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                            Klik untuk upload foto
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WEBP (Max 5MB)
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                )}
                {uploadError && (
                    <p className="text-red-500 text-xs mt-2 text-center">
                        {uploadError}
                    </p>
                )}
            </div>

            {/* FORM FIELDS */}
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
                            placeholder="Contoh: Nasi Goreng Spesial"
                        />
                    </div>
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-4">
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
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
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
                            >
                                {allCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {t[cat] ||
                                            cat.charAt(0).toUpperCase() +
                                                cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCategoryInput(!showCategoryInput)
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md text-gray-500"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

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

                {/* --- BADGE / LABEL (MANUAL) --- */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block ml-1 flex items-center gap-1">
                        <Star size={12} /> Label / Badge (Manual)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BADGE_OPTIONS.map((option) => (
                            <button
                                key={option.value || "none"}
                                type="button"
                                onClick={() =>
                                    handleChange("badge", option.value)
                                }
                                className={`px-3 py-2 rounded-lg text-left border transition-all relative overflow-hidden ${
                                    form.badge === option.value
                                        ? "ring-2 ring-offset-1 ring-blue-500 bg-white"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span
                                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${option.color.replace(
                                            "border-",
                                            ""
                                        )} bg-opacity-20`}
                                    >
                                        {option.label}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    {option.desc}
                                </p>

                                {form.badge === option.value && (
                                    <div className="absolute top-0 right-0 p-1 bg-blue-500 text-white rounded-bl-lg">
                                        <Check size={10} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                        {t.description}
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            handleChange("description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:bg-white resize-none transition-all"
                        placeholder="Deskripsi menu..."
                    />
                </div>
            </div>

            {/* Action Buttons */}
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
                    className="flex-1 px-4 py-3 text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                    style={{ background: theme?.buttonBg || "#666fb8" }}
                >
                    {t.save}
                </button>
            </div>

            {/* CROP MODAL */}
            <Modal
                isOpen={showCropModal}
                onClose={() => {
                    setShowCropModal(false);
                    setImageSrc(null);
                }}
                title="Sesuaikan Foto Menu"
            >
                <div className="space-y-4">
                    <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden shadow-inner">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <ZoomIn size={16} className="text-gray-500" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="flex justify-center gap-2">
                            {[
                                { l: "1:1", v: 1 },
                                { l: "4:3", v: 4 / 3 },
                                { l: "16:9", v: 16 / 9 },
                            ].map((r) => (
                                <button
                                    key={r.l}
                                    type="button"
                                    onClick={() => setAspect(r.v)}
                                    className={`px-3 py-1 text-xs rounded-md border ${
                                        aspect === r.v
                                            ? "bg-gray-800 text-white border-gray-800"
                                            : "bg-white text-gray-600 border-gray-200"
                                    }`}
                                >
                                    {r.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 border-t mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCropModal(false);
                                setImageSrc(null);
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveCrop}
                            disabled={uploading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
                            style={{ background: theme?.buttonBg }}
                        >
                            {uploading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Check size={18} />
                            )}
                            {uploading ? "Menyimpan..." : "Simpan Foto"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ItemForm;
