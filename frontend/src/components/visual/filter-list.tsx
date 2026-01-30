"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface FilterListProps {
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  limit?: number;
  showAll: boolean;
  onToggleShowAll: () => void;
}

export default function FilterList({
  items,
  selectedValue,
  onSelect,
  limit = 5,
  showAll,
  onToggleShowAll,
}: FilterListProps) {
  const displayedItems = showAll ? items : items.slice(0, limit);

  return (
    <ul className="space-y-1 mt-2">
      {items.length === 0 && (
        <li className="text-xs text-gray-400 italic px-3 py-2 bg-gray-50 rounded-lg">
          Nenhuma opção disponível
        </li>
      )}

      {displayedItems.map((item) => (
        <li key={item}>
          <button
            onClick={() => onSelect(selectedValue === item ? "" : item)}
            className={`w-full text-left text-sm py-2 px-3 rounded-xl transition-all flex justify-between items-center group ${
              selectedValue === item
                ? "bg-denin text-white font-bold shadow-md shadow-denin/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-denin"
            }`}
          >
            <span className="truncate pr-2">{item}</span>
            {selectedValue === item && (
              <span className="text-[10px] opacity-70 font-black">✕</span>
            )}
          </button>
        </li>
      ))}

      {items.length > limit && (
        <button
          onClick={onToggleShowAll}
          className="text-[11px] font-bold text-denin mt-2 flex items-center gap-1 hover:bg-denin/5 py-1 px-3 rounded-lg transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp size={14} /> Ver menos
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Ver todos ({items.length})
            </>
          )}
        </button>
      )}
    </ul>
  );
}
