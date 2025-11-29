import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Loader2,
    Store,
    ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTemplate } from "../contexts/TemplateContext";

export function LoginPage() {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const { t, lang } = useLanguage();
    const { theme } = useTemplate(); // Ambil konfigurasi tema

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        role: "user", // 'user' or 'admin'
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                const { error } = await signIn(form.email, form.password);
                if (error) throw error;
                navigate("/");
            } else {
                if (!form.name.trim()) {
                    throw new Error(
                        lang === "id" ? "Nama wajib diisi" : "Name is required"
                    );
                }
                const { error } = await signUp(
                    form.email,
                    form.password,
                    form.name,
                    form.role
                );
                if (error) throw error;
                setIsLogin(true);
                setError(
                    lang === "id"
                        ? "Registrasi berhasil! Silakan login."
                        : "Registration successful! Please login."
                );
            }
        } catch (err) {
            setError(
                err.message ||
                    (lang === "id" ? "Terjadi kesalahan" : "An error occurred")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 transition-all duration-500"
            style={{ background: theme.bgGradient }} // Background dinamis
        >
            <div className="w-full max-w-md">
                {/* Back to menu */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    {lang === "id" ? "Kembali ke Menu" : "Back to Menu"}
                </button>

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Card */}
                    <div
                        className="p-6 text-white text-center transition-all duration-500"
                        style={{ background: theme.bgGradient }} // Header dinamis
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                            <Store size={32} />
                        </div>
                        <h1 className="text-2xl font-bold">BookletKu</h1>
                        <p className="text-white/80 text-sm">{t.tagline}</p>
                    </div>

                    {/* Tabs (Login / Register) */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setIsLogin(true)}
                            className="flex-1 py-3 text-sm font-medium transition-all duration-300 border-b-2"
                            style={{
                                color: isLogin ? theme.primary : "#6b7280",
                                borderColor: isLogin
                                    ? theme.primary
                                    : "transparent",
                                backgroundColor: isLogin
                                    ? `${theme.primary}0D`
                                    : "transparent",
                            }}
                        >
                            {lang === "id" ? "Masuk" : "Login"}
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className="flex-1 py-3 text-sm font-medium transition-all duration-300 border-b-2"
                            style={{
                                color: !isLogin ? theme.primary : "#6b7280",
                                borderColor: !isLogin
                                    ? theme.primary
                                    : "transparent",
                                backgroundColor: !isLogin
                                    ? `${theme.primary}0D`
                                    : "transparent",
                            }}
                        >
                            {lang === "id" ? "Daftar" : "Register"}
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Name Input (Register Only) */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {lang === "id"
                                        ? "Nama Lengkap"
                                        : "Full Name"}
                                </label>
                                <div className="relative group">
                                    <User
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                                        style={{ color: theme.iconColor }}
                                    />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            handleChange("name", e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all"
                                        style={{ borderColor: "#e5e7eb" }}
                                        onFocus={(e) =>
                                            (e.target.style.borderColor =
                                                theme.primary)
                                        }
                                        onBlur={(e) =>
                                            (e.target.style.borderColor =
                                                "#e5e7eb")
                                        }
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                                    style={{ color: theme.iconColor }}
                                />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all"
                                    style={{ borderColor: "#e5e7eb" }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor =
                                            theme.primary)
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                                    style={{ color: theme.iconColor }}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    className="w-full pl-10 pr-12 py-2.5 border rounded-lg outline-none transition-all"
                                    style={{ borderColor: "#e5e7eb" }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor =
                                            theme.primary)
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                    placeholder="********"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Role Selection (Register Only) */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {lang === "id"
                                        ? "Daftar sebagai"
                                        : "Register as"}
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleChange("role", "user")
                                        }
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border"
                                        style={{
                                            background:
                                                form.role === "user"
                                                    ? theme.buttonBg
                                                    : "#f3f4f6",
                                            color:
                                                form.role === "user"
                                                    ? "white"
                                                    : "#374151",
                                            borderColor:
                                                form.role === "user"
                                                    ? "transparent"
                                                    : "#e5e7eb",
                                        }}
                                    >
                                        {lang === "id"
                                            ? "Pelanggan"
                                            : "Customer"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleChange("role", "admin")
                                        }
                                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border"
                                        style={{
                                            background:
                                                form.role === "admin"
                                                    ? theme.buttonBg
                                                    : "#f3f4f6",
                                            color:
                                                form.role === "admin"
                                                    ? "white"
                                                    : "#374151",
                                            borderColor:
                                                form.role === "admin"
                                                    ? "transparent"
                                                    : "#e5e7eb",
                                        }}
                                    >
                                        {lang === "id"
                                            ? "Pemilik Toko"
                                            : "Store Owner"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div
                                className="p-3 rounded-lg text-sm transition-colors"
                                style={{
                                    backgroundColor:
                                        error.includes("berhasil") ||
                                        error.includes("successful")
                                            ? `${theme.primary}1A`
                                            : "#FEF2F2",
                                    color:
                                        error.includes("berhasil") ||
                                        error.includes("successful")
                                            ? theme.primary
                                            : "#DC2626",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-white rounded-lg font-medium shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                            style={{ background: theme.buttonBg }}
                        >
                            {loading && (
                                <Loader2 size={18} className="animate-spin" />
                            )}
                            {isLogin
                                ? lang === "id"
                                    ? "Masuk"
                                    : "Login"
                                : lang === "id"
                                ? "Daftar"
                                : "Register"}
                        </button>
                    </form>

                    {/* Demo Account Info */}
                    <div className="px-6 pb-6">
                        <div className="text-center text-xs text-gray-500 border-t pt-4">
                            <p className="mb-2 font-medium">
                                {lang === "id" ? "Akun Demo:" : "Demo Account:"}
                            </p>
                            <p>Admin: admin@bookletku.com / admin123</p>
                            <p>User: user@bookletku.com / user123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
