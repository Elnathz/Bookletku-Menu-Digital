import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  X,
  Minus,
  Plus,
  MessageCircle,
  Trash2,
  Send,
  Store,
  ChevronDown,
  ChevronUp,
  User,
  LogIn,
  Settings,
  Globe,
  Image as ImageIcon,
  TrendingUp,
  Award,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useSupabase } from "../hooks/useSupabase";
import { useTemplate } from "../contexts/TemplateContext";

const { currentTemplate } = useTemplate();
const colors = currentTemplate.colors;

const CATEGORIES = ["all", "food", "drink", "snack", "dessert", "other"];

function Badge({ children, variant }) {
  const cls =
    variant === "trending"
      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      : "bg-gradient-to-r from-amber-400 to-orange-500 text-white";
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${cls}`}
    >
      {children}
    </span>
  );
}

function MenuItemCard({ item, onClick }) {
  const { t } = useLanguage();
  const isPopular = item.views > 80 && item.views <= 150;
  const isTrending = item.views > 150;
  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);
  const colors = currentTemplate.colors();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all group"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isTrending && (
            <Badge variant="trending">
              <TrendingUp size={10} /> {t.trending}
            </Badge>
          )}
          {isPopular && (
            <Badge variant="popular">
              <Award size={10} /> {t.popularItem}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
            {item.description}
          </p>
        )}
        <p className="text-green-600 font-bold mt-1">
          Rp {formatPrice(item.price)}
        </p>
      </div>
    </div>
  );
}

// Modal Detail Item
function ItemDetailModal({ item, isOpen, onClose, onAddToCart }) {
  const { t, lang } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  if (!isOpen || !item) return null;

  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);
  const totalPrice = item.price * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, note);
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
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-video bg-gray-100">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={48} className="text-gray-300" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          {item.views > 150 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="trending">
                <TrendingUp size={10} /> {t.trending}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-2xl font-bold text-green-600 mt-1">
            Rp {formatPrice(item.price)}
          </p>

          {item.description && (
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Quantity */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === "id" ? "Jumlah Pesanan" : "Quantity"}
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="text-2xl font-bold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === "id" ? "Catatan (opsional)" : "Note (optional)"}
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
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold transition-colors"
          >
            <ShoppingCart size={20} />
            {lang === "id" ? "Tambah ke Keranjang" : "Add to Cart"} - Rp{" "}
            {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublicMenu() {
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLanguage();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { items, settings, incrementViews } = useSupabase();

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items
    .filter(
      (item) => selectedCategory === "all" || item.category === selectedCategory
    )
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order);

  const addToCart = (item, qty = 1, note = "") => {
    incrementViews(item.id);
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id
            ? { ...c, qty: c.qty + qty, note: note || c.note }
            : c
        );
      }
      return [...prev, { ...item, qty, note }];
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const updateItemNote = (id, note) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((c) => c.id !== id));
  const clearCart = () => {
    setCart([]);
    setShowCart(false);
    setShowOrderForm(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);

  const getDateTime = () => {
    return new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const orderTypeLabels = {
    "dine-in": lang === "id" ? "Makan di Tempat" : "Dine In",
    takeaway: lang === "id" ? "Bawa Pulang" : "Takeaway",
    delivery: lang === "id" ? "Delivery" : "Delivery",
  };

  const orderTypeEmoji = {
    "dine-in": String.fromCodePoint(0x1f37d), // 🍽
    takeaway: String.fromCodePoint(0x1f961), // 🥡
    delivery: String.fromCodePoint(0x1f69a), // 🚚
  };

  // FIXED: Generate WhatsApp message dengan emoji yang benar
  const generateWhatsAppMessage = () => {
    let lines = [];
    lines.push(lang === "id" ? "=== PESANAN BARU ===" : "=== NEW ORDER ===");
    lines.push("");
    lines.push(settings.storeName || "Store");
    lines.push(getDateTime());
    lines.push("-------------------");
    lines.push("");
    if (customerName)
      lines.push((lang === "id" ? "Nama: " : "Name: ") + customerName);
    lines.push(
      (lang === "id" ? "Tipe: " : "Type: ") + orderTypeLabels[orderType]
    );
    if (orderType === "dine-in" && tableNumber)
      lines.push((lang === "id" ? "No. Meja: " : "Table: ") + tableNumber);
    lines.push("");
    lines.push(
      lang === "id" ? "--- DETAIL PESANAN ---" : "--- ORDER DETAILS ---"
    );
    lines.push("");
    cart.forEach((item, i) => {
      lines.push(i + 1 + ". " + item.name);
      lines.push("   " + item.qty + "x @ Rp " + formatPrice(item.price));
      lines.push("   = Rp " + formatPrice(item.price * item.qty));
      if (item.note) lines.push("   Catatan: " + item.note);
      lines.push("");
    });
    lines.push("-------------------");
    lines.push(
      "TOTAL: Rp " + formatPrice(totalPrice) + " (" + totalItems + " item)"
    );
    lines.push("-------------------");
    if (customerNote) {
      lines.push("");
      lines.push((lang === "id" ? "Catatan: " : "Note: ") + customerNote);
    }
    lines.push("");
    lines.push(lang === "id" ? "Terima kasih!" : "Thank you!");
    return lines.join("\n");
  };

  const orderViaWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const phone = (settings.whatsappNumber || "").replace(/[^0-9]/g, "");
    window.open(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(message),
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="{colors.button} text-white sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <h1 className="font-bold">
                  {settings.storeName || "BookletKu"}
                </h1>
                <p className="text-green-100 text-xs">{t.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <Globe size={18} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <User size={18} />
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
                      {isAuthenticated ? (
                        <>
                          <div className="p-3 border-b bg-gray-50">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isAdmin ? "Admin" : "User"}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                navigate("/admin");
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Settings size={16} />
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
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <User size={16} />
                            {lang === "id" ? "Profil Saya" : "My Profile"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            navigate("/login");
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogIn size={16} />
                          {lang === "id"
                            ? "Masuk / Daftar"
                            : "Login / Register"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative p-2 bg-white/20 rounded-lg"
                >
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-green-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                {cat === "all" ? t.allCategories : t[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Store size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">{t.noResults || t.noItems}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 z-30"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </button>
      )}

      {/* Cart Panel */}
      {showCart && cart.length > 0 && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowCart(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-green-600" />
                {lang === "id" ? "Keranjang" : "Cart"} ({totalItems})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[35vh] p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex gap-3">
                    {item.photo && (
                      <img
                        src={item.photo}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-green-600 font-bold text-sm">
                        Rp {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border rounded"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border rounded"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto p-1 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.note || ""}
                    onChange={(e) => updateItemNote(item.id, e.target.value)}
                    placeholder={lang === "id" ? "Catatan..." : "Note..."}
                    className="w-full mt-2 px-2 py-1 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>

            {showOrderForm && (
              <div className="border-t p-4 bg-gray-50 space-y-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === "id" ? "Nama Anda" : "Your Name"}
                  className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  {Object.entries(orderTypeLabels).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setOrderType(k)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        orderType === k
                          ? "bg-green-500 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {orderType === "dine-in" && (
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder={lang === "id" ? "No. Meja" : "Table No."}
                    className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                  />
                )}
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={
                    lang === "id"
                      ? "Catatan tambahan..."
                      : "Additional notes..."
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-green-500 resize-none"
                />
              </div>
            )}

            <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold">
                    Rp {formatPrice(totalPrice)}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className="text-xs text-green-600 flex items-center gap-1"
                >
                  {showOrderForm ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}{" "}
                  Detail
                </button>
              </div>
              <button
                onClick={orderViaWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600"
              >
                <MessageCircle size={20} />
                {lang === "id" ? "Pesan via WhatsApp" : "Order via WhatsApp"}
                <Send size={16} />
              </button>
              <button
                onClick={clearCart}
                className="w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg"
              >
                {lang === "id" ? "Kosongkan Keranjang" : "Clear Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicMenu;
