import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import {
    User,
    Mail,
    ArrowLeft,
    LogOut,
    Globe,
    Edit2,
    Save,
    X,
    Lock,
    Eye,
    EyeOff,
    Camera,
    Loader2,
    ZoomIn,
    Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../config/supabase";
import { useSupabase } from "../hooks/useSupabase";
import { useTemplate } from "../contexts/TemplateContext";
import Toast from "./Toast";
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

// --- MAIN COMPONENT ---

export function UserProfile() {
    const navigate = useNavigate();
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { t, lang, toggleLang } = useLanguage();
    const { theme } = useTemplate();
    const { uploadAvatar } = useSupabase();

    // Form State
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [name, setName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Crop & Upload State
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [imageType, setImageType] = useState("image/jpeg");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const [toast, setToast] = useState({ message: "", type: "" });

    const [orders] = useState([
        {
            id: 1,
            date: "2024-11-20",
            total: 85000,
            items: 4,
            status: "completed",
        },
        {
            id: 2,
            date: "2024-11-18",
            total: 45000,
            items: 2,
            status: "completed",
        },
        {
            id: 3,
            date: "2024-11-15",
            total: 120000,
            items: 6,
            status: "completed",
        },
    ]);
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    useEffect(() => {
        if (profile) {
            setName(profile.name || user?.user_metadata?.name || "");
        }
    }, [profile, user]);

    const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);

    const showMessage = (type, text) => {
        setToast({ message: text, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    // --- VALIDASI FILE DI SINI ---
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // 1. Validasi Ukuran File (Maks 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
            if (file.size > maxSize) {
                showMessage(
                    "error",
                    lang === "id"
                        ? "Ukuran file terlalu besar! Maksimal 5MB."
                        : "File too large! Max 5MB."
                );
                e.target.value = null; // Reset input
                return;
            }

            // 2. Validasi Tipe File (Hanya JPG, JPEG, PNG)
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                showMessage(
                    "error",
                    lang === "id"
                        ? "Format file tidak didukung! Gunakan JPG atau PNG."
                        : "Invalid file format! Use JPG or PNG."
                );
                e.target.value = null; // Reset input
                return;
            }

            // Jika lolos validasi
            setImageType(file.type);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);

            e.target.value = null;
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setUploadingPhoto(true);
        try {
            const croppedBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                imageType
            );
            const extension = imageType.split("/")[1] || "jpeg";
            const fileName = `avatar-${Date.now()}.${extension}`;

            const fileToUpload = new File([croppedBlob], fileName, {
                type: imageType,
            });

            await uploadAvatar(fileToUpload, user.id);
            await refreshProfile();

            setShowCropModal(false);
            setImageSrc(null);
            showMessage(
                "success",
                lang === "id" ? "Foto berhasil disimpan!" : "Photo saved!"
            );
        } catch (e) {
            console.error("Upload Error Log:", e);
            showMessage(
                "error",
                lang === "id"
                    ? "Gagal menyimpan foto."
                    : "Failed to save photo."
            );
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleUpdateName = async () => {
        if (!name.trim())
            return showMessage("error", "Nama tidak boleh kosong");
        setLoading(true);
        try {
            await supabase.auth.updateUser({ data: { name: name.trim() } });
            await supabase
                .from("user_profiles")
                .update({ name: name.trim() })
                .eq("id", user.id);
            await refreshProfile();
            showMessage("success", "Nama diperbarui!");
            setIsEditingName(false);
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6)
            return showMessage("error", "Min 6 karakter");
        if (newPassword !== confirmPassword)
            return showMessage("error", "Password tidak cocok");
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            showMessage("success", "Password berhasil diperbarui!");
            setIsEditingPassword(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            showMessage("error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {toast.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "" })}
                />
            )}

            {/* Header */}
            <div
                className="text-white p-4 pb-24 transition-all duration-500"
                style={{
                    background:
                        theme?.bgGradient ||
                        "linear-gradient(to right, #333fa1, #000f89)",
                }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 hover:bg-white/20 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-bold">
                        {lang === "id" ? "Profil Saya" : "My Profile"}
                    </h1>
                </div>
            </div>

            {/* Profile Card */}
            <div className="px-4 -mt-20">
                <div className="bg-white rounded-2xl shadow-lg border p-6 flex flex-col items-center text-center relative">
                    <div className="relative mb-4 group">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center relative">
                            {profile?.avatar_url ? (
                                <img
                                    key={profile.avatar_url}
                                    src={`${
                                        profile.avatar_url
                                    }?t=${Date.now()}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            "https://via.placeholder.com/150?text=User";
                                    }}
                                />
                            ) : (
                                <User size={40} className="text-gray-400" />
                            )}

                            {uploadingPhoto && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2
                                        size={24}
                                        className="text-white animate-spin"
                                    />
                                </div>
                            )}
                        </div>

                        <label
                            className="absolute bottom-0 right-0 p-2 text-white rounded-full shadow-md cursor-pointer hover:opacity-90 transition-colors z-20"
                            style={{ background: theme?.primary || "#666fb8" }}
                        >
                            <Camera size={16} />
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg" // Filter di dialog OS
                                className="hidden"
                                onChange={onFileChange}
                                disabled={uploadingPhoto}
                            />
                        </label>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                        {profile?.name || user?.user_metadata?.name || "User"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {profile?.email || user?.email}
                    </p>
                    <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase tracking-wider">
                        {profile?.role || "User"}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4">
                <div className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2">
                            <p
                                className="text-2xl font-bold"
                                style={{ color: theme?.primary }}
                            >
                                {totalOrders}
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === "id"
                                    ? "Total Pesanan"
                                    : "Total Orders"}
                            </p>
                        </div>
                        <div className="text-center p-2 border-l">
                            <p className="text-2xl font-bold text-green-600">
                                Rp {formatPrice(totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === "id"
                                    ? "Total Belanja"
                                    : "Total Spent"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forms */}
            <div className="p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">
                    {lang === "id" ? "Edit Informasi" : "Edit Information"}
                </h3>

                {/* Name Form */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            {lang === "id" ? "Nama Lengkap" : "Full Name"}
                        </label>
                        <button
                            onClick={() => setIsEditingName(!isEditingName)}
                            style={{ color: theme?.primary }}
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    {isEditingName ? (
                        <div className="flex gap-2 mt-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2"
                                style={{ focusRingColor: theme?.primary }}
                            />
                            <button
                                onClick={handleUpdateName}
                                disabled={loading}
                                className="px-3 py-2 text-white rounded-lg text-sm"
                                style={{ background: theme?.buttonBg }}
                            >
                                <Save size={16} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-800">{name}</p>
                    )}
                </div>

                {/* Password Form */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <button
                            onClick={() =>
                                setIsEditingPassword(!isEditingPassword)
                            }
                            style={{ color: theme?.primary }}
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    {isEditingPassword ? (
                        <div className="space-y-2 mt-2">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg text-sm pr-10 outline-none focus:ring-2"
                                />
                                <button
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-2 text-gray-400"
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2"
                            />
                            <button
                                onClick={handleUpdatePassword}
                                disabled={loading}
                                className="w-full py-2 text-white rounded-lg text-sm"
                                style={{ background: theme?.buttonBg }}
                            >
                                {lang === "id"
                                    ? "Simpan Password"
                                    : "Save Password"}
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-800">••••••••</p>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div className="p-4 pb-10">
                <h3 className="font-semibold text-gray-900 mb-3">
                    {lang === "id" ? "Pengaturan Lainnya" : "Other Settings"}
                </h3>
                <div className="bg-white rounded-xl border overflow-hidden">
                    <button
                        onClick={toggleLang}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b"
                    >
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-gray-500" />
                            <span>{lang === "id" ? "Bahasa" : "Language"}</span>
                        </div>
                        <span className="text-gray-500">
                            {lang === "id" ? "Indonesia" : "English"}
                        </span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        <span>{lang === "id" ? "Keluar" : "Logout"}</span>
                    </button>
                </div>
            </div>

            {/* --- CROP MODAL --- */}
            <Modal
                isOpen={showCropModal}
                onClose={() => {
                    setShowCropModal(false);
                    setImageSrc(null);
                }}
                title={lang === "id" ? "Sesuaikan Foto" : "Adjust Photo"}
            >
                <div className="space-y-4">
                    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <ZoomIn size={16} className="text-gray-500" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => {
                                setShowCropModal(false);
                                setImageSrc(null);
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            {lang === "id" ? "Batal" : "Cancel"}
                        </button>
                        <button
                            onClick={handleSaveCrop}
                            disabled={uploadingPhoto}
                            className="flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2"
                            style={{ background: theme?.buttonBg || "#666fb8" }}
                        >
                            {uploadingPhoto ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Check size={18} />
                            )}
                            {lang === "id" ? "Simpan" : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default UserProfile;
