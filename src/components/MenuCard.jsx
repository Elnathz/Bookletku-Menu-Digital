import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
  Plus,
  TrendingUp,
  Award,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    popular: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
    trending: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function PopularBadge({ label = "Popular" }) {
  return (
    <Badge variant="popular">
      <Award size={8} />
      {label}
    </Badge>
  );
}

export function TrendingBadge({ label = "Trending" }) {
  return (
    <Badge variant="trending">
      <TrendingUp size={8} />
      {label}
    </Badge>
  );
}

// Admin Card
export function MenuCard({ item, onEdit, onDelete, isAdmin = true }) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPopular = item.views > 80 && item.views <= 150;
  const isTrending = item.views > 150;
  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border overflow-hidden ${
        isDragging ? "shadow-xl scale-105" : "hover:shadow-md"
      } transition-all`}
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-1 left-1">
          {isTrending && <TrendingBadge label={t.trending} />}
          {isPopular && <PopularBadge label={t.popularItem} />}
        </div>
        {isAdmin && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-1 right-1 p-1 bg-white/90 rounded cursor-grab"
          >
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
                onClick={() => onEdit(item)}
                className="p-1 hover:bg-blue-50 rounded"
              >
                <Edit2 size={10} className="text-blue-500" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 hover:bg-red-50 rounded"
              >
                <Trash2 size={10} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Customer Card - Compact
export function MenuCardSimple({ item, onClick }) {
  const { t } = useLanguage();
  const isPopular = item.views > 80 && item.views <= 150;
  const isTrending = item.views > 150;
  const formatPrice = (p) => new Intl.NumberFormat("id-ID").format(p);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg active:scale-95 transition-all group"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-1 left-1">
          {isTrending && <TrendingBadge label={t.trending} />}
          {isPopular && <PopularBadge label={t.popularItem} />}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#666fb8]  text-white p-2 rounded-full shadow-lg">
            <Plus size={16} />
          </div>
        </div>
      </div>
      <div className="p-2">
        <h3 className="font-medium text-gray-900 text-xs truncate">
          {item.name}
        </h3>
        <p className="text-[#666fb8] font-bold text-sm">
          Rp {formatPrice(item.price)}
        </p>
      </div>
    </div>
  );
}

export default MenuCard;
