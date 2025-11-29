import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    alert, // Prop baru: { type: 'success' | 'error', message: '...' }
}) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-4xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`
            relative bg-white rounded-3xl shadow-2xl 
            w-full ${sizes[size]} 
            max-h-[90vh] flex flex-col overflow-hidden
            animate-slideUp ring-1 ring-black/5
        `}
            >
                {/* --- HEADER DINAMIS (Normal / Success / Error) --- */}
                {alert ? (
                    // TAMPILAN ALERT
                    <div
                        className={`flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 transition-colors duration-300 ${
                            alert.type === "success"
                                ? "bg-green-50 border-green-100"
                                : "bg-red-50 border-red-100"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-full flex items-center justify-center shadow-sm ${
                                    alert.type === "success"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                }`}
                            >
                                {alert.type === "success" ? (
                                    <CheckCircle
                                        size={24}
                                        className="animate-bounce"
                                    />
                                ) : (
                                    <AlertCircle size={24} />
                                )}
                            </div>
                            <div>
                                <h2
                                    className={`text-lg font-bold ${
                                        alert.type === "success"
                                            ? "text-green-800"
                                            : "text-red-800"
                                    }`}
                                >
                                    {alert.type === "success"
                                        ? "Berhasil Disimpan!"
                                        : "Gagal Menyimpan"}
                                </h2>
                                {alert.message && (
                                    <p
                                        className={`text-xs font-medium ${
                                            alert.type === "success"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {alert.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-all duration-200 ${
                                alert.type === "success"
                                    ? "text-green-400 hover:bg-green-100 hover:text-green-700"
                                    : "text-red-400 hover:bg-red-100 hover:text-red-700"
                            }`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    // TAMPILAN HEADER BIASA
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
