"use client";

import React from "react";
import { EVENT_CATEGORIES, EventCategory } from "@/lib/events/types";
import { Layers } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: EventCategory | "all";
  onSelectCategory: (category: EventCategory | "all") => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
}) => {
  return (
    <div className="w-full bg-paper-card border border-rule rounded-sm p-3 shadow-editorial">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-ink-primary tracking-wide">
          <Layers className="w-3.5 h-3.5 text-ochre" />
          <span>主題領域分類</span>
        </div>
        <span className="text-[11px] text-ink-muted">共 {totalCount} 場活動</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {/* 'All' Chip */}
        <button
          type="button"
          aria-pressed={selectedCategory === "all"}
          onClick={() => onSelectCategory("all")}
          className={`px-3 py-1.5 rounded text-xs font-sans transition-all flex items-center gap-1.5 border min-h-[36px] ${
            selectedCategory === "all"
              ? "bg-ink-primary text-paper-card border-ink-primary shadow-sm font-semibold"
              : "bg-paper border-rule text-ink-secondary hover:text-ink-primary hover:border-rule-dark hover:bg-paper-muted"
          }`}
        >
          <span>全部分類</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              selectedCategory === "all"
                ? "bg-paper/20 text-paper-card"
                : "bg-paper-muted text-ink-muted"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Category Chips */}
        {EVENT_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCategory(isSelected ? "all" : cat)}
              className={`px-2.5 py-1.5 rounded text-xs font-sans transition-all flex items-center gap-1.5 border min-h-[36px] ${
                isSelected
                  ? "bg-ochre text-white border-ochre font-semibold shadow-sm"
                  : count > 0
                  ? "bg-paper border-rule text-ink-secondary hover:text-ink-primary hover:border-rule-dark hover:bg-paper-muted"
                  : "bg-paper/40 border-rule/50 text-ink-faint cursor-default"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected
                      ? "bg-black/20 text-white"
                      : "bg-paper-muted text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
