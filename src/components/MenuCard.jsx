import React, { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical,
    Edit2,
    Trash2,
    Eye,
    Image as ImageIcon,
    TrendingUp,
    Award,
    Star,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Fungsi helper untuk merender badge
export function Badge({ label, type }) {
    const styles = {
        popular: "bg-orange-100 text-orange-700",
        trending: "bg-pink-100 text-pink-700",
        new: "bg-blue-100 text-blue-700",
        bestseller: "bg-yellow-100 text-yellow-700",
        recommended: "bg-green-100 text-green-700",
    };

    const labels = {
        popular: "Popular",
        trending: "Trending",
        new: "New",
        bestseller: "Best Seller",
        recommended: "Recommended",
    };

    const style = styles[type] || "bg-gray-100 text-gray-700";
    const text = labels[type] || label;

    if (!type) return null;

    return (
        <span
            className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm ${style}`}
        >
            {text}
        </span>
    );
}

// Komponen UI Kartu
export const MenuCardItem = forwardRef(
    (
        {
            item,
            onEdit,
            onDelete,
            isAdmin = true,
            showGrip = true, // <--- PROP BARU: Default true
            style,
            isDragging,
            isOverlay,
            ...props
        },
        ref
    ) => {
        const { t } = useLanguage();
        const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);

        return (
            <div
                ref={ref}
                style={style}
                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                    isOverlay
                        ? "shadow-2xl scale-105 rotate-2 cursor-grabbing border-[#666fb8]"
                        : "hover:shadow-md"
                } ${isDragging ? "opacity-30" : "opacity-100"}`}
                {...props}
            >
                <div className="relative aspect-[4/3] bg-gray-100">
                    {item.photo ? (
                        <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-gray-300" />
                        </div>
                    )}

                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {item.badge && <Badge type={item.badge} />}
                    </div>

                    {/* Tampilkan Grip HANYA jika isAdmin=true DAN showGrip=true */}
                    {isAdmin && showGrip && !isOverlay && (
                        <div className="absolute top-1 right-1 p-1 bg-white/90 rounded cursor-grab active:cursor-grabbing hover:bg-white shadow-sm">
                            <GripVertical size={12} className="text-gray-500" />
                        </div>
                    )}
                </div>

                <div className="p-2">
                    <h3 className="font-semibold text-gray-900 text-xs truncate">
                        {item.name}
                    </h3>
                    <p className="text-[#666fb8] font-bold text-sm">
                        Rp {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t">
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Eye size={8} />
                            {item.views}
                        </span>
                        {isAdmin && (
                            <div className="flex gap-0.5">
                                <button
                                    onClick={() => onEdit && onEdit(item)}
                                    className="p-1 hover:bg-blue-50 rounded"
                                >
                                    <Edit2
                                        size={10}
                                        className="text-blue-500"
                                    />
                                </button>
                                <button
                                    onClick={() =>
                                        onDelete && onDelete(item.id)
                                    }
                                    className="p-1 hover:bg-red-50 rounded"
                                >
                                    <Trash2
                                        size={10}
                                        className="text-red-500"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

// Sortable Wrapper (untuk Drag & Drop)
export function MenuCard({
    item,
    onEdit,
    onDelete,
    isAdmin = true,
    showGrip = true,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <MenuCardItem
            ref={setNodeRef}
            style={style}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
            showGrip={showGrip} // Pass prop ke bawah
            isDragging={isDragging}
            {...attributes}
            {...listeners}
        />
    );
}

export default MenuCard;
