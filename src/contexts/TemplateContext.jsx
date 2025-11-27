// File baru: src/contexts/TemplateContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
  const [template, setTemplate] = useState(() => {
    const saved = localStorage.getItem("bookletku-template");
    return saved || "minimalist";
  });

  useEffect(() => {
    localStorage.setItem("bookletku-template", template);
  }, [template]);

  // Template configurations
  const templates = {
    minimalist: {
      id: "minimalist",
      name: "Minimalist",
      colors: {
        primary: "green",
        secondary: "emerald",
        gradient: "from-[#333fa1] to-[#000f89]",
        button: "bg-[#666fb8]  hover:bg-[#666fb8] ",
        buttonText: "text-white",
        badge: "bg-green-100 text-[#333fa1]",
      },
    },
    colorful: {
      id: "colorful",
      name: "Colorful",
      colors: {
        primary: "purple",
        secondary: "pink",
        gradient: "from-purple-600 to-pink-600",
        button: "bg-purple-500 hover:bg-purple-600",
        buttonText: "text-white",
        badge: "bg-purple-100 text-purple-700",
      },
    },
  };

  const currentTemplate = templates[template] || templates.minimalist;

  const value = {
    template,
    setTemplate,
    currentTemplate,
    templates,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within a TemplateProvider");
  }
  return context;
}

export default TemplateContext;

// ===============================================
// Update PublicMenu.jsx - Gunakan template colors
// ===============================================
/*
// Di bagian atas component PublicMenu, tambah:
import { useTemplate } from "../contexts/TemplateContext";

// Di dalam component:
const { currentTemplate } = useTemplate();
const colors = currentTemplate.colors;

// Ganti semua class warna hijau dengan variable colors:
// Contoh:
// BEFORE: className="bg-gradient-to-r from-[#333fa1] to-[#000f89]"
// AFTER:  className={`bg-gradient-to-r ${colors.gradient}`}

// ===============================================
// Update AdminDashboard Settings - Simpan template
// ===============================================
/*
import { useTemplate } from "../contexts/TemplateContext";

// Di dalam AdminDashboard atau SettingsPage:
const { setTemplate } = useTemplate();

// Saat save settings:
const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setTemplate(newSettings.template); // Terapkan template
};
*/
