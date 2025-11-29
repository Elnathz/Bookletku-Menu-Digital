import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    X,
    Minus,
    Plus,
    Image as ImageIcon,
    TrendingUp,
    Award,
    UtensilsCrossed,
    Package as PackageIcon,
    Truck,
    Globe,
    User,
    LogIn,
    Settings,
    LogOut,
    Store,
    Share2,
} from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSupabase } from "../hooks/useSupabase";
import { useTemplate } from "../contexts/TemplateContext";
import Toast from "./Toast";

// --- Components ---

function Badge({ children, variant }) {
    // Badge tetap vibrant agar mencolok
    const cls =
        variant === "trending"
            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            : "bg-gradient-to-r from-amber-400 to-orange-500 text-white";

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${cls}`}
        >
            {children}
        </span>
    );
}

function MenuItemCardLarge({ item, onClick, theme }) {
    const { t } = useLanguage();
    const isPopular = (item?.views || 0) > 80 && (item?.views || 0) <= 150;
    const isTrending = (item?.views || 0) > 150;

    const formatPrice = (p) =>
        new Intl.NumberFormat("id-ID").format(Number(p || 0));

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border overflow-hidden cursor-pointer hover:shadow-lg active:scale-[0.99] transition-transform duration-150 group"
            // Hover border effect mengikuti warna tema
            style={{
                borderColor: "transparent",
                boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
        >
            <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                {item?.photo ? (
                    <img
                        src={item.photo}
                        alt={item?.name || ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://placehold.co/400x300?text=No+Image";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Icon Placeholder Warnanya Mengikuti Tema */}
                        <ImageIcon
                            size={36}
                            className="opacity-30"
                            style={{ color: theme.iconColor }}
                        />
                    </div>
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isTrending && (
                        <Badge variant="trending">
                            <TrendingUp size={12} /> {t?.trending || "Trending"}
                        </Badge>
                    )}
                    {isPopular && (
                        <Badge variant="popular">
                            <Award size={12} /> {t?.popularItem || "Popular"}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-opacity-80 transition-colors">
                    {item?.name}
                </h3>
                {item?.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-3">
                    {/* HARGA WARNA-WARNI */}
                    <p
                        className="font-bold text-lg"
                        style={{ color: theme.priceColor }}
                    >
                        Rp {formatPrice(item?.price)}
                    </p>
                    <div className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-500 capitalize">
                        {item?.category}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemDetailModal({ item, isOpen, onClose, onAdd, theme }) {
    const { t, lang } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");

    if (!isOpen || !item) return null;

    const formatPrice = (p) =>
        new Intl.NumberFormat("id-ID").format(Number(p || 0));
    const totalPrice = Number(item.price || 0) * quantity || 0;

    const handleAdd = () => {
        if (onAdd) onAdd(item, quantity, note);
        setQuantity(1);
        setNote("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-auto shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative aspect-[16/9] bg-gray-100">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                                (e.currentTarget.src =
                                    "https://placehold.co/400x300?text=No+Image")
                            }
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon
                                size={48}
                                className="opacity-30"
                                style={{ color: theme.iconColor }}
                            />
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                        {item.name}
                    </h2>
                    {/* Harga Detail Modal */}
                    <p
                        className="text-2xl font-bold mt-2"
                        style={{ color: theme.priceColor }}
                    >
                        Rp {formatPrice(item.price)}
                    </p>

                    {item.description && (
                        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                            {item.description}
                        </p>
                    )}

                    <div className="mt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {lang === "id" ? "Jumlah Pesanan" : "Quantity"}
                        </label>

                        <div className="flex items-center gap-4">
                            {/* Tombol Minus */}
                            <button
                                onClick={() =>
                                    setQuantity(Math.max(1, quantity - 1))
                                }
                                className="w-10 h-10 flex items-center justify-center border rounded-lg transition-colors hover:bg-gray-50"
                                style={{
                                    borderColor: theme.primary,
                                    color: theme.primary,
                                }}
                            >
                                <Minus size={18} />
                            </button>

                            <span className="text-2xl font-bold w-12 text-center">
                                {quantity}
                            </span>

                            {/* Tombol Plus */}
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center border rounded-lg transition-colors hover:bg-gray-50"
                                style={{
                                    borderColor: theme.primary,
                                    color: theme.primary,
                                }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {lang === "id"
                                ? "Catatan (opsional)"
                                : "Note (optional)"}
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={
                                lang === "id"
                                    ? "Contoh: pedas, tanpa sayur..."
                                    : "e.g. spicy, no vegetables..."
                            }
                            className="w-full px-4 py-2.5 border rounded-lg outline-none transition-all"
                            // Focus ring mengikuti tema
                            style={{
                                borderColor: "#e5e7eb",
                                boxShadow: note
                                    ? `0 0 0 1px ${theme.focusRing}`
                                    : "none",
                            }}
                        />
                    </div>

                    {/* Tombol Add to Cart */}
                    <button
                        onClick={handleAdd}
                        className="w-full mt-5 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold shadow-md transition-transform active:scale-[0.98]"
                        style={{ background: theme.buttonBg }}
                    >
                        <ShoppingCart size={18} />
                        {lang === "id"
                            ? "Tambah ke Keranjang"
                            : "Add to Cart"}{" "}
                        - Rp {formatPrice(totalPrice)}
                    </button>
                </div>
            </div>
        </div>
    );
}

function OrderTypeModal({ isOpen, onClose, onSelect, theme }) {
    const { lang } = useLanguage();

    if (!isOpen) return null;

    const orderTypes = [
        {
            id: "dine-in",
            icon: UtensilsCrossed,
            label: lang === "id" ? "Makan di Tempat" : "Dine In",
            desc:
                lang === "id" ? "Nikmati di tempat kami" : "Enjoy at our place",
            color: "from-orange-500 to-red-500", // Icon background gradients (static)
        },
        {
            id: "takeaway",
            icon: PackageIcon,
            label: lang === "id" ? "Bawa Pulang" : "Takeaway",
            desc: lang === "id" ? "Pesan & bawa pulang" : "Order & take home",
            color: "from-blue-500 to-cyan-500",
        },
        {
            id: "delivery",
            icon: Truck,
            label: lang === "id" ? "Antar (Delivery)" : "Delivery",
            desc: lang === "id" ? "Kirim ke alamat Anda" : "Deliver to you",
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    {/* Icon Header Modal mengikuti tema */}
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-opacity-10"
                        style={{ backgroundColor: `${theme.primary}20` }}
                    >
                        <ShoppingCart
                            size={26}
                            style={{ color: theme.iconColor }}
                        />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                        {lang === "id"
                            ? "Pilih Tipe Pesanan"
                            : "Select Order Type"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {lang === "id"
                            ? "Bagaimana Anda ingin memesan?"
                            : "How would you like to order?"}
                    </p>

                    <div className="space-y-3">
                        {orderTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    if (onSelect) onSelect(type.id);
                                }}
                                className="w-full p-3 rounded-xl border hover:shadow-md transition-all flex items-center gap-4 group"
                            >
                                <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}
                                >
                                    <type.icon
                                        size={20}
                                        className="text-white"
                                    />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-semibold text-gray-900">
                                        {type.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {type.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-4 text-sm text-gray-600 w-full py-2.5 rounded-lg hover:bg-gray-100"
                    >
                        {lang === "id" ? "Batal" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Component ---

const DEFAULT_CATEGORIES = [
    "all",
    "food",
    "drink",
    "snack",
    "dessert",
    "other",
];

export default function PublicMenu() {
    const { items = [], settings = {}, loading, updateItem } = useSupabase();
    const { user, isAuthenticated, isAdmin, signOut } = useAuth();
    const { t = {}, lang, toggleLang } = useLanguage();
    const { theme } = useTemplate(); // Get Dynamic Theme
    const navigate = useNavigate();

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
    const [selectedOrderType, setSelectedOrderType] = useState(null);
    const [showStoreDetails, setShowStoreDetails] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Derived Values & Helper Functions
    const categories = useMemo(() => {
        if (!items) return ["all"];
        const derived = [
            "all",
            ...DEFAULT_CATEGORIES.filter((c) =>
                items.some((it) => it.category === c)
            ),
            ...Array.from(
                new Set(
                    items
                        .map((i) => i.category)
                        .filter((c) => c && !DEFAULT_CATEGORIES.includes(c))
                )
            ),
        ];
        return derived;
    }, [items]);

    const cartTotal = cart.reduce(
        (sum, it) => sum + Number(it.price || 0) * (it.quantity || 0),
        0
    );
    const cartItemsCount = cart.reduce(
        (sum, it) => sum + (it.quantity || 0),
        0
    );

    const showToast = (msg, type = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast({ message: "", type: "" }), 3000);
    };

    const capitalize = (s) => {
        if (!s) return "";
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Cart Logic
    const addToCart = (item, qty = 1, note = "") => {
        setCart((prev) => {
            const existingIndex = prev.findIndex(
                (p) => p.id === item.id && (p.note || "") === (note || "")
            );
            if (existingIndex >= 0) {
                const copy = [...prev];
                copy[existingIndex].quantity =
                    (copy[existingIndex].quantity || 0) + qty;
                return copy;
            }
            return [...prev, { ...item, quantity: qty, note }];
        });
        showToast(
            t?.addedToCart ||
                (lang === "id" ? "Ditambahkan ke keranjang" : "Added to cart")
        );
    };

    const updateCartQty = (index, newQty) => {
        if (newQty <= 0) return;
        setCart((prev) =>
            prev.map((it, i) =>
                i === index ? { ...it, quantity: newQty } : it
            )
        );
    };

    const removeFromCart = (index) =>
        setCart((prev) => prev.filter((_, i) => i !== index));

    const onItemClick = async (item) => {
        setSelectedItem(item);
        try {
            await updateItem(item.id, { views: (item.views || 0) + 1 });
        } catch (e) {
            console.warn("update views failed", e);
        }
    };

    const handleOrderTypeSelect = (type) => {
        setSelectedOrderType(type);
        setShowOrderTypeModal(false);
        setIsCartOpen(true);
    };

    const orderViaWhatsApp = () => {
        const phone = (settings?.whatsappNumber || "").replace(/[^0-9]/g, "");
        if (!phone) {
            showToast(
                lang === "id"
                    ? "Nomor WhatsApp belum diset."
                    : "WhatsApp number not set.",
                "error"
            );
            return;
        }

        // Generate Message
        const storeName = settings?.storeName || "Store";
        const lines = [];
        lines.push(`*Order from ${storeName}*`);
        lines.push(`Type: ${selectedOrderType || "unknown"}`);
        lines.push("");
        cart.forEach((it, idx) => {
            lines.push(
                `${idx + 1}. ${it.name} x${it.quantity} - Rp ${Number(
                    it.price || 0
                ).toLocaleString("id-ID")}`
            );
            if (it.note) lines.push(`   note: ${it.note}`);
        });
        lines.push("");
        lines.push(
            `TOTAL: Rp ${Number(cartTotal || 0).toLocaleString("id-ID")}`
        );

        const url =
            "https://wa.me/" +
            phone +
            "?text=" +
            encodeURIComponent(lines.join("\n"));
        window.open(url, "_blank");
    };

    // Filter Items
    const filteredGroups = useMemo(() => {
        if (!items) return [];
        const q = (searchQuery || "").trim().toLowerCase();
        const source =
            selectedCategory === "all"
                ? items
                : items.filter((i) => i.category === selectedCategory);
        const filtered = source.filter((i) =>
            (i?.name || "").toLowerCase().includes(q)
        );

        if (selectedCategory === "all") {
            const groups = {};
            filtered.forEach((i) => {
                const cat = i.category || "other";
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(i);
            });
            return Object.entries(groups).map(([category, items]) => ({
                category,
                items,
            }));
        }
        return [{ category: selectedCategory, items: filtered }];
    }, [items, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header - DYNAMIC THEME BACKGROUND */}
            <header
                className="shadow-sm sticky top-0 z-40 text-white transition-all duration-500"
                style={{ background: theme.bgGradient }}
            >
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Store size={20} />
                            {settings?.storeName || "BookletKu"}
                        </h1>
                        <p className="text-sm opacity-90">
                            {settings?.storeLocation || ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => toggleLang && toggleLang()}
                            className="p-2 rounded-md hover:bg-white/20 transition-colors"
                        >
                            <Globe size={18} />
                        </button>

                        <button
                            onClick={() => setShowStoreDetails((s) => !s)}
                            className="p-2 rounded-md hover:bg-white/20 transition-colors"
                        >
                            <span className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center font-bold text-xs">
                                i
                            </span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-2 hover:bg-white/20 rounded-md transition-colors"
                            >
                                <User size={20} />
                            </button>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border z-50 overflow-hidden animate-fadeIn text-gray-800">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="p-3 border-b bg-gray-50">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user?.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {isAdmin
                                                            ? "Admin"
                                                            : "User"}
                                                    </p>
                                                </div>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => {
                                                            navigate("/admin");
                                                            setShowUserMenu(
                                                                false
                                                            );
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                                    >
                                                        <Settings
                                                            size={16}
                                                            style={{
                                                                color: theme.iconColor,
                                                            }}
                                                        />{" "}
                                                        {lang === "id"
                                                            ? "Dashboard Admin"
                                                            : "Admin Dashboard"}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                                >
                                                    <User
                                                        size={16}
                                                        style={{
                                                            color: theme.iconColor,
                                                        }}
                                                    />{" "}
                                                    {lang === "id"
                                                        ? "Profil Saya"
                                                        : "My Profile"}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        await signOut();
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left border-t"
                                                >
                                                    <LogOut size={16} />{" "}
                                                    {lang === "id"
                                                        ? "Keluar"
                                                        : "Logout"}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    navigate("/login");
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                            >
                                                <LogIn
                                                    size={16}
                                                    style={{
                                                        color: theme.iconColor,
                                                    }}
                                                />{" "}
                                                {lang === "id"
                                                    ? "Masuk / Daftar"
                                                    : "Login / Register"}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {showStoreDetails && (
                    <div className="bg-white border-t text-gray-800">
                        <div className="max-w-5xl mx-auto px-4 py-3 text-sm">
                            <div>
                                <strong>{t?.location || "Location"}:</strong>{" "}
                                {settings?.storeLocation || "-"}
                            </div>
                            <div>
                                <strong>{t?.operatingHours || "Hours"}:</strong>{" "}
                                {settings?.operatingHours || "-"}
                            </div>
                            <div>
                                <strong>WhatsApp:</strong>{" "}
                                {settings?.whatsappNumber
                                    ? `+${settings.whatsappNumber}`
                                    : "-"}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Search Bar - DYNAMIC FOCUS RING */}
            <div className="max-w-5xl mx-auto px-4 pt-5">
                <input
                    type="text"
                    placeholder={t?.searchPlaceholder || "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border rounded-xl outline-none transition-all duration-300"
                    style={{
                        borderColor: "transparent",
                        boxShadow: `0 0 0 2px ${
                            searchQuery ? theme.focusRing : "#e5e7eb"
                        }`,
                    }}
                />
            </div>

            {/* Categories - DYNAMIC ACTIVE BACKGROUND */}
            <div className="max-w-5xl mx-auto px-4 py-4 overflow-x-auto flex gap-3 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 shadow-sm font-medium"
                        style={{
                            background:
                                selectedCategory === cat
                                    ? theme.buttonBg
                                    : "#ffffff",
                            color:
                                selectedCategory === cat
                                    ? "#ffffff"
                                    : "#4b5563",
                            border:
                                selectedCategory === cat
                                    ? "none"
                                    : "1px solid #e5e7eb",
                        }}
                    >
                        {t?.categories?.[cat] || capitalize(cat)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4">
                {loading && (
                    <p className="text-center py-10">
                        {t?.loading || "Loading..."}
                    </p>
                )}
                {!loading && filteredGroups.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <PackageIcon
                            size={48}
                            className="mx-auto text-gray-300 mb-2"
                        />
                        {t?.noItems || "No items yet"}
                    </div>
                )}

                {filteredGroups.map((group) => (
                    <section key={group.category} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 capitalize text-gray-800">
                            {t?.categories?.[group.category] ||
                                capitalize(group.category)}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {group.items.map((item) => (
                                <MenuItemCardLarge
                                    key={item.id}
                                    item={item}
                                    theme={theme}
                                    onClick={() => onItemClick(item)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Floating Cart - DYNAMIC BACKGROUND */}
            {cart.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full shadow-lg text-white font-semibold flex items-center gap-3 animate-slideUp"
                    style={{ background: theme.buttonBg }}
                >
                    <ShoppingCart size={20} />
                    {t?.cart || "Cart"} ({cartItemsCount})
                </button>
            )}

            {/* Modals */}
            <ItemDetailModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onAdd={addToCart}
                theme={theme}
            />
            <OrderTypeModal
                isOpen={showOrderTypeModal}
                onSelect={handleOrderTypeSelect}
                onClose={() => setShowOrderTypeModal(false)}
                theme={theme}
            />

            {/* Cart Panel */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex justify-end"
                    onClick={() => setIsCartOpen(false)}
                >
                    <div
                        className="w-full sm:w-[420px] bg-white h-full shadow-xl flex flex-col animate-slideLeft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">
                                    {t?.yourCart || "Your Cart"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {cartItemsCount} {t?.items || "items"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        setShowOrderTypeModal(true);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                                >
                                    {t?.chooseType || "Type"}
                                </button>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="text-gray-500 p-1 hover:bg-gray-100 rounded"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.map((it, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-3 pb-3 border-b"
                                >
                                    <img
                                        src={
                                            it.photo ||
                                            "https://placehold.co/100x100?text=No+Image"
                                        }
                                        alt={it.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium text-gray-900">
                                                {it.name}
                                            </h4>
                                            {/* Cart Item Price - DYNAMIC COLOR */}
                                            <div
                                                className="text-sm font-semibold"
                                                style={{
                                                    color: theme.priceColor,
                                                }}
                                            >
                                                Rp{" "}
                                                {Number(
                                                    it.price
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>
                                        {it.note && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                📝 {it.note}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() =>
                                                    updateCartQty(
                                                        idx,
                                                        (it.quantity || 0) - 1
                                                    )
                                                }
                                                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                            >
                                                -
                                            </button>
                                            <span className="px-2 font-medium">
                                                {it.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateCartQty(
                                                        idx,
                                                        (it.quantity || 0) + 1
                                                    )
                                                }
                                                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() =>
                                                    removeFromCart(idx)
                                                }
                                                className="ml-auto text-red-500 p-1 hover:bg-red-50 rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                    {t?.noItemsInCart || "Cart is empty"}
                                </p>
                            )}
                        </div>

                        <footer className="p-4 border-t">
                            <div className="flex justify-between mb-3">
                                <div>
                                    <div className="text-sm text-gray-500">
                                        {t?.total || "Total"}
                                    </div>
                                    <div className="text-xl font-bold">
                                        Rp{" "}
                                        {Number(cartTotal).toLocaleString(
                                            "id-ID"
                                        )}
                                    </div>
                                </div>
                                <div className="w-40">
                                    {/* Checkout Button - DYNAMIC BACKGROUND */}
                                    <button
                                        onClick={() => {
                                            if (!selectedOrderType) {
                                                setShowOrderTypeModal(true);
                                                setIsCartOpen(false);
                                            } else {
                                                orderViaWhatsApp();
                                            }
                                        }}
                                        className="w-full py-3 rounded-lg text-white font-semibold shadow-md active:scale-95 transition-transform"
                                        style={{ background: theme.buttonBg }}
                                    >
                                        {t?.orderNow || "Order Now"}
                                    </button>
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        {t?.viaWhatsApp || "Via WhatsApp"}
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            )}

            {toast?.message && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ message: "", type: "" })}
                />
            )}
        </div>
    );
}
