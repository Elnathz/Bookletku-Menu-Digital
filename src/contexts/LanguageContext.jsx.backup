import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../locales/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem("bookletku-lang");
        if (saved) return saved;

        // Check browser language
        const browserLang = navigator.language.split("-")[0];
        return browserLang === "id" ? "id" : "en";
    });

    useEffect(() => {
        localStorage.setItem("bookletku-lang", lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = translations[lang];

    const toggleLang = () => {
        setLang((prev) => (prev === "id" ? "en" : "id"));
    };

    const value = {
        lang,
        setLang,
        toggleLang,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

export default LanguageContext;
