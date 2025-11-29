import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
} from "react";

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
    // Load settings from localStorage
    const [themeConfig, setThemeConfig] = useState(() => {
        const saved = localStorage.getItem("bookletku-theme");
        return saved
            ? JSON.parse(saved)
            : { mode: "minimalist", color: "#666fb8" };
    });

    useEffect(() => {
        localStorage.setItem("bookletku-theme", JSON.stringify(themeConfig));
    }, [themeConfig]);

    // Generate dynamic styles based on config
    const theme = useMemo(() => {
        const { mode, color } = themeConfig;

        if (mode === "colorful") {
            return {
                // --- PRESET COLORFUL (Lebih Hidup) ---
                name: "Colorful",
                // Warna dasar untuk border/text biasa
                primary: "#8b5cf6", // Violet-500

                // Background Header (Gradient)
                bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", // Violet to Pink

                // Background Tombol Utama & Kategori Aktif (Gradient)
                buttonBg: "linear-gradient(to right, #8b5cf6, #ec4899)",

                // Warna Teks Harga (Pink cerah agar kontras)
                priceColor: "#db2777", // Pink-600

                // Warna Ikon-ikon (Violet cerah)
                iconColor: "#7c3aed", // Violet-600

                // Focus ring untuk input (Pink)
                focusRing: "#ec4899",

                // Badge (Label Trending/Popular)
                badgeBg:
                    "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
            };
        } else {
            // --- PRESET MINIMALIST (Satu Warna Dominan) ---
            return {
                name: "Minimalist",
                primary: color,

                // Header Gradient (Warna utama ke sedikit lebih gelap)
                bgGradient: `linear-gradient(135deg, ${color} 0%, ${adjustColor(
                    color,
                    -20
                )} 100%)`,

                // Tombol solid (Warna utama)
                buttonBg: color,

                // Harga mengikuti warna utama
                priceColor: color,

                // Ikon mengikuti warna utama
                iconColor: color,

                // Focus ring mengikuti warna utama
                focusRing: color,

                badgeBg: "bg-gray-100 text-gray-700",
            };
        }
    }, [themeConfig]);

    const updateTheme = (key, value) => {
        setThemeConfig((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <TemplateContext.Provider value={{ themeConfig, updateTheme, theme }}>
            {children}
        </TemplateContext.Provider>
    );
}

// Helper to darken/lighten hex color
function adjustColor(color, amount) {
    return (
        "#" +
        color
            .replace(/^#/, "")
            .replace(/../g, (color) =>
                (
                    "0" +
                    Math.min(
                        255,
                        Math.max(0, parseInt(color, 16) + amount)
                    ).toString(16)
                ).substr(-2)
            )
    );
}

export function useTemplate() {
    return useContext(TemplateContext);
}

export default TemplateContext;
