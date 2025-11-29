import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
    Menu,
    Plus,
    Eye,
    QrCode,
    Share2,
    Settings,
    Loader2,
    X,
    LayoutDashboard,
    Package,
    Users,
    DollarSign,
    TrendingUp,
    LogOut,
    ChevronRight,
    Store,
    BarChart3,
    Clock,
    MapPin,
    Phone,
    Globe, // Globe sudah diimport
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSupabase } from "../hooks/useSupabase";
import { useTemplate } from "../contexts/TemplateContext";
import Modal from "./Modal";
import ItemForm from "./itemForm";
import { MenuCard } from "./MenuCard";
import QRCodeDisplay from "./QRCode";

// --- Components Helper ---

function StatCard({ icon: Icon, label, value, trend, color }) {
    const colors = {
        blue: "bg-blue-500",
        green: "bg-[#666fb8]",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
    };
    return (
        <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${colors[color]} text-white`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className="flex items-center text-xs text-[#666fb8] font-medium">
                        <TrendingUp size={12} className="mr-0.5" />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold mt-3">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}

// Sidebar Component (FIXED POSITION & PROFILE BOTTOM)
function Sidebar({ isOpen, onClose, currentPage, onNavigate }) {
    const { t, lang } = useLanguage();
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            id: "dashboard",
            icon: LayoutDashboard,
            label: lang === "id" ? "Dashboard" : "Dashboard",
        },
        {
            id: "menu",
            icon: Package,
            label: lang === "id" ? "Kelola Menu" : "Manage Menu",
        },
        {
            id: "settings",
            icon: Settings,
            label: lang === "id" ? "Pengaturan" : "Settings",
        },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transform transition-transform duration-300
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
            >
                {/* Flex Container untuk menata Header, Menu, dan Footer */}
                <div className="flex flex-col h-full">
                    {/* 1. Header Sidebar */}
                    <div className="p-4 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#666fb8] to-[#333fa1] rounded-xl flex items-center justify-center">
                                <Store size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">
                                    BookletKu
                                </h1>
                                <p className="text-xs text-gray-500">
                                    Admin Panel
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* 2. Menu Navigation (Flex Grow agar mengisi ruang tengah) */}
                    <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    onClose();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    currentPage === item.id
                                        ? "bg-[#e6e8f7] text-[#666fb8]"
                                        : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-medium">
                                    {item.label}
                                </span>
                                {currentPage === item.id && (
                                    <ChevronRight
                                        size={16}
                                        className="ml-auto"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* 3. User Profile (Selalu di Bawah / Bottom) */}
                    <div className="p-4 border-t bg-gray-50 shrink-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white border rounded-full flex items-center justify-center">
                                <Users size={18} className="text-[#666fb8]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user?.email || "Admin"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Administrator
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            {lang === "id" ? "Keluar" : "Logout"}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Settings Page Component (UPDATED: 0-59 MINUTES)
function SettingsPage({ settings, onSave }) {
    const { t, lang, toggleLang } = useLanguage();
    const { themeConfig, updateTheme } = useTemplate();

    // Helper data untuk dropdown
    const hours = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, "0")
    );

    // FIX: Menit lengkap dari 00 sampai 59
    const minutes = Array.from({ length: 60 }, (_, i) =>
        i.toString().padStart(2, "0")
    );

    // State Form
    const [form, setForm] = useState({
        storeName: "",
        storeLocation: "",
        whatsappNumber: "",
        openHour: "08",
        openMinute: "00",
        closeHour: "22",
        closeMinute: "00",
    });

    const [saved, setSaved] = useState(false);

    // Sinkronisasi data saat settings dimuat
    useEffect(() => {
        if (settings) {
            let oh = "08",
                om = "00",
                ch = "22",
                cm = "00";

            // Parse format string "08:00 - 22:00"
            if (settings.operatingHours) {
                const parts = settings.operatingHours.split(" - ");
                if (parts.length === 2) {
                    const openParts = parts[0].split(":");
                    const closeParts = parts[1].split(":");

                    if (openParts.length === 2) {
                        oh = openParts[0];
                        om = openParts[1];
                    }
                    if (closeParts.length === 2) {
                        ch = closeParts[0];
                        cm = closeParts[1];
                    }
                }
            }

            setForm({
                storeName: settings.storeName || "",
                storeLocation: settings.storeLocation || "",
                whatsappNumber: settings.whatsappNumber || "",
                openHour: oh,
                openMinute: om,
                closeHour: ch,
                closeMinute: cm,
            });
        }
    }, [settings]);

    const handleSave = async () => {
        // Gabungkan kembali menjadi string "HH:MM - HH:MM"
        const fullOperatingHours = `${form.openHour}:${form.openMinute} - ${form.closeHour}:${form.closeMinute}`;

        const dataToSave = {
            storeName: form.storeName,
            storeLocation: form.storeLocation,
            whatsappNumber: form.whatsappNumber,
            operatingHours: fullOperatingHours,
        };

        await onSave(dataToSave);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">
            {/* Tampilan Web Config */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
                <div className="text-center pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                        {lang === "id" ? "Tampilan Web" : "Web Appearance"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {lang === "id"
                            ? "Sesuaikan warna dan tema menu digital Anda"
                            : "Customize your digital menu theme"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => updateTheme("mode", "minimalist")}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            themeConfig.mode === "minimalist"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div
                            className="w-full h-12 rounded-lg bg-gray-200 mb-2 shadow-sm"
                            style={{ background: themeConfig.color }}
                        ></div>
                        <span className="font-semibold text-sm">
                            Minimalist
                        </span>
                    </button>

                    <button
                        onClick={() => updateTheme("mode", "colorful")}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            themeConfig.mode === "colorful"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <div className="w-full h-12 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 mb-2 shadow-sm"></div>
                        <span className="font-semibold text-sm">Colorful</span>
                    </button>
                </div>

                {themeConfig.mode === "minimalist" && (
                    <div className="animate-fadeIn pt-2 border-t mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {lang === "id"
                                ? "Warna Utama Toko"
                                : "Primary Store Color"}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={themeConfig.color}
                                onChange={(e) =>
                                    updateTheme("color", e.target.value)
                                }
                                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer p-1 bg-white"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={themeConfig.color}
                                    onChange={(e) =>
                                        updateTheme("color", e.target.value)
                                    }
                                    className="w-full px-4 py-2 border rounded-lg uppercase font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Informasi Toko Config */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
                <div className="text-center pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-900">
                        {lang === "id" ? "Informasi Toko" : "Store Information"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {lang === "id"
                            ? "Kelola informasi dasar toko Anda"
                            : "Manage basic store info"}
                    </p>
                </div>

                {/* Store Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Store size={16} /> {t.storeName}
                    </label>
                    <input
                        type="text"
                        value={form.storeName}
                        onChange={(e) =>
                            setForm({ ...form, storeName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Contoh: Warung Makan Barokah"
                    />
                </div>

                {/* Store Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} />{" "}
                        {lang === "id" ? "Lokasi Toko" : "Store Location"}
                    </label>
                    <input
                        type="text"
                        value={form.storeLocation}
                        onChange={(e) =>
                            setForm({ ...form, storeLocation: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#666fb8] outline-none"
                        placeholder="Jl. Sudirman No. 123"
                    />
                </div>

                {/* Operating Hours (SPLIT HOUR & MINUTE 0-59) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock size={16} />{" "}
                        {lang === "id" ? "Jam Operasional" : "Operating Hours"}
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Jam Buka */}
                        <div className="flex-1 bg-gray-50 p-3 rounded-lg border">
                            <span className="text-xs font-semibold text-gray-500 mb-2 block uppercase">
                                Buka (Open)
                            </span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={form.openHour}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            openHour: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-center font-mono cursor-pointer"
                                >
                                    {hours.map((h) => (
                                        <option key={`oh-${h}`} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                                <span className="font-bold">:</span>
                                <select
                                    value={form.openMinute}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            openMinute: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-center font-mono cursor-pointer"
                                >
                                    {minutes.map((m) => (
                                        <option key={`om-${m}`} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Jam Tutup */}
                        <div className="flex-1 bg-gray-50 p-3 rounded-lg border">
                            <span className="text-xs font-semibold text-gray-500 mb-2 block uppercase">
                                Tutup (Close)
                            </span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={form.closeHour}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            closeHour: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-center font-mono cursor-pointer"
                                >
                                    {hours.map((h) => (
                                        <option key={`ch-${h}`} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                                <span className="font-bold">:</span>
                                <select
                                    value={form.closeMinute}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            closeMinute: e.target.value,
                                        })
                                    }
                                    className="flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-center font-mono cursor-pointer"
                                >
                                    {minutes.map((m) => (
                                        <option key={`cm-${m}`} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone size={16} /> {t.whatsappNumber}
                    </label>
                    <input
                        type="text"
                        value={form.whatsappNumber}
                        onChange={(e) =>
                            setForm({ ...form, whatsappNumber: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="628123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {lang === "id"
                            ? "Format: 628xxx (tanpa + atau 0)"
                            : "Format: 628xxx (without + or 0)"}
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    style={{
                        background:
                            themeConfig.mode === "minimalist"
                                ? themeConfig.color
                                : undefined,
                    }}
                    className={`w-full py-3 rounded-lg font-medium transition-all text-white shadow-md active:scale-95 ${
                        saved
                            ? "bg-green-600 hover:bg-green-700"
                            : themeConfig.mode === "colorful"
                            ? "bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90"
                            : "hover:opacity-90"
                    }`}
                >
                    {saved
                        ? lang === "id"
                            ? "Perubahan Disimpan!"
                            : "Changes Saved!"
                        : t.save}
                </button>
            </div>

            {/* Language Settings */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="text-center pb-4 border-b mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {lang === "id"
                            ? "Pengaturan Bahasa"
                            : "Language Settings"}
                    </h3>
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={toggleLang}
                        className="flex items-center gap-3 px-6 py-3 border-2 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <Globe size={22} className="text-gray-600" />
                        <div>
                            <p className="font-semibold text-gray-800">
                                {lang === "id" ? "Indonesia" : "English"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {lang === "id"
                                    ? "Bahasa Indonesia"
                                    : "English Language"}
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Dashboard Overview Page
function DashboardOverview({ items }) {
    const { lang } = useLanguage();

    const totalItems = items.length;
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalRevenue = items.reduce(
        (sum, item) => sum + item.price * (item.views || 0) * 0.1,
        0
    );
    // Estimate
    const avgPrice =
        items.length > 0
            ? items.reduce((sum, item) => sum + item.price, 0) / items.length
            : 0;
    const formatPrice = (p) =>
        new Intl.NumberFormat("id-ID").format(Math.round(p));
    const topItems = [...items]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Package}
                    label={lang === "id" ? "Total Menu" : "Total Menu"}
                    value={totalItems}
                    color="blue"
                />
                <StatCard
                    icon={Eye}
                    label={lang === "id" ? "Total Dilihat" : "Total Views"}
                    value={formatPrice(totalViews)}
                    trend="+12%"
                    color="green"
                />
                <StatCard
                    icon={DollarSign}
                    label={lang === "id" ? "Est. Pendapatan" : "Est. Revenue"}
                    value={`Rp ${formatPrice(totalRevenue)}`}
                    trend="+8%"
                    color="purple"
                />
                <StatCard
                    icon={BarChart3}
                    label={lang === "id" ? "Rata-rata Harga" : "Avg. Price"}
                    value={`Rp ${formatPrice(avgPrice)}`}
                    color="orange"
                />
            </div>

            {/* Top Items */}
            <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#666fb8]" />
                    {lang === "id" ? "Menu Terpopuler" : "Popular Menu"}
                </h3>
                <div className="space-y-3">
                    {topItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0
                                        ? "bg-yellow-400 text-white"
                                        : index === 1
                                        ? "bg-gray-300 text-gray-700"
                                        : index === 2
                                        ? "bg-orange-400 text-white"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {index + 1}
                            </span>
                            {item.photo && (
                                <img
                                    src={item.photo}
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Rp {formatPrice(item.price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-[#666fb8]">
                                    {item.views || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {lang === "id" ? "views" : "views"}
                                </p>
                            </div>
                        </div>
                    ))}
                    {topItems.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                            {lang === "id" ? "Belum ada data" : "No data yet"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Main Admin Dashboard
export function AdminDashboard() {
    const { t, lang, toggleLang } = useLanguage();
    const navigate = useNavigate();
    const {
        items,
        settings,
        customCategories,
        addCustomCategory,
        loading,
        addItem,
        updateItem,
        deleteItem,
        reorderItems,
        uploadPhoto,
        setSettings,
    } = useSupabase();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [modal, setModal] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [notification, setNotification] = useState("");

    const menuSlug =
        settings.storeName
            ?.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "menu";
    const baseUrl = window.location.origin;
    const menuLink = `${baseUrl}/menu/${menuSlug}`;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 2500);
    };
    const copyLink = async () => {
        await navigator.clipboard.writeText(menuLink);
        showNotif(t.linkCopied);
    };
    const handleSaveItem = async (formData) => {
        try {
            if (editingItem) {
                await updateItem(editingItem.id, formData);
                showNotif(t.itemUpdated);
                setEditingItem(null);
            } else {
                await addItem(formData);
                showNotif(t.itemAdded);
                setModal(null);
            }
        } catch (err) {
            console.error("Save failed:", err);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm(t.confirmDelete)) {
            await deleteItem(id);
            showNotif(t.itemDeleted);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            reorderItems(arrayMove(items, oldIndex, newIndex));
        }
    };
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#666fb8]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b sticky top-0 z-30">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Burger Menu - Mobile Only */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                            >
                                <Menu size={20} />
                            </button>
                            <h2 className="font-semibold text-gray-900">
                                {currentPage === "dashboard" &&
                                    (lang === "id" ? "Dashboard" : "Dashboard")}
                                {currentPage === "menu" &&
                                    (lang === "id"
                                        ? "Kelola Menu"
                                        : "Manage Menu")}
                                {currentPage === "settings" &&
                                    (lang === "id" ? "Pengaturan" : "Settings")}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLang}
                                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <Globe size={14} />
                                {lang.toUpperCase()}
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-[#333fa1] rounded-lg hover:bg-green-200"
                            >
                                <Eye size={14} />
                                {lang === "id" ? "Lihat Menu" : "View Menu"}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Notification */}
                {notification && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#666fb8]  text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-slideDown">
                        {notification}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {/* Dashboard Page */}
                    {currentPage === "dashboard" && (
                        <DashboardOverview items={items} />
                    )}

                    {/* Menu Management Page */}
                    {currentPage === "menu" && (
                        <div className="space-y-4">
                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setModal("add")}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#666fb8]  text-white rounded-lg hover:bg-[#333fa1]  text-sm font-medium"
                                >
                                    <Plus size={16} />
                                    {t.addItem}
                                </button>
                                <button
                                    onClick={() => setModal("qr")}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    <QrCode size={16} />
                                    {t.generateQR}
                                </button>
                                <button
                                    onClick={copyLink}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                                >
                                    <Share2 size={16} />
                                    {t.copyLink}
                                </button>
                            </div>

                            {/* Menu Grid */}
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">
                                    {t.menuItems} ({items.length})
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t.dragToReorder}
                                </p>
                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
                                    <Package
                                        size={40}
                                        className="mx-auto text-gray-300 mb-3"
                                    />
                                    <p className="text-gray-500 mb-2">
                                        {t.noItems}
                                    </p>
                                    <button
                                        onClick={() => setModal("add")}
                                        className="text-[#666fb8] font-medium hover:underline"
                                    >
                                        {t.addFirstItem}
                                    </button>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={sortedItems.map((i) => i.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {sortedItems.map((item) => (
                                                <MenuCard
                                                    key={item.id}
                                                    item={item}
                                                    onEdit={(item) => {
                                                        setEditingItem(item);
                                                        setModal("edit");
                                                    }}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    )}

                    {/* Settings Page */}
                    {currentPage === "settings" && (
                        <SettingsPage
                            settings={settings}
                            onSave={setSettings}
                        />
                    )}
                </main>
            </div>

            {/* Modals */}
            <Modal
                isOpen={modal === "add"}
                onClose={() => setModal(null)}
                title={t.addItem}
            >
                <ItemForm
                    customCategories={customCategories}
                    addCustomCategory={addCustomCategory}
                    onSave={handleSaveItem}
                    onCancel={() => setModal(null)}
                    onUploadPhoto={uploadPhoto}
                />
            </Modal>

            <Modal
                isOpen={modal === "edit"}
                onClose={() => {
                    setModal(null);
                    setEditingItem(null);
                }}
                title={t.editItem}
            >
                {editingItem && (
                    <ItemForm
                        item={editingItem}
                        customCategories={customCategories}
                        addCustomCategory={addCustomCategory}
                        onSave={handleSaveItem}
                        onCancel={() => {
                            setModal(null);
                            setEditingItem(null);
                        }}
                        onUploadPhoto={uploadPhoto}
                    />
                )}
            </Modal>

            <Modal
                isOpen={modal === "qr"}
                onClose={() => setModal(null)}
                title={t.generateQR}
            >
                <QRCodeDisplay value={menuLink} />
            </Modal>
        </div>
    );
}

export default AdminDashboard;
