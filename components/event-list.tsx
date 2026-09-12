"use client";

import React from "react";
import { Event } from "@/lib/events/types";
import { formatTaipeiDateTime } from "@/lib/events/normalize";
import {
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  Search,
  Sparkles,
  Info,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface EventListProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (event: Event | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterSummary: string[];
}

export const EventList: React.FC<EventListProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  searchQuery,
  onSearchChange,
  onResetFilters,
  hasActiveFilters,
  activeFilterSummary,
}) => {
  return (
    <div className="flex flex-col h-full bg-paper-card border border-rule rounded-sm shadow-editorial overflow-hidden">
      {/* Header & Search Bar */}
      <div className="p-3.5 border-b border-rule bg-paper-subtle/50 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-ink-primary">
              活動行程冊
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-paper-muted text-ink-secondary border border-rule">
              共 {events.length} 場
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-ochre hover:text-white hover:bg-ochre px-2 py-1 rounded border border-ochre-border transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重設全部篩選</span>
            </button>
          )}
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋活動名稱、場館、演出者或關鍵字..."
            aria-label="搜尋活動關鍵字"
            className="w-full pl-9 pr-8 py-2 text-xs bg-paper border border-rule rounded focus:outline-none focus:border-ink-secondary focus:ring-1 focus:ring-ink-secondary/20 font-sans text-ink-primary placeholder:text-ink-faint transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="清除搜尋"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink-primary px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeFilterSummary.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-ink-muted text-[11px]">已套用：</span>
            {activeFilterSummary.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-ochre-light text-ochre font-medium border border-ochre-border text-[11px]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Events List */}
      <div className="flex-1 overflow-y-auto divide-y divide-rule p-2 sm:p-3 space-y-2.5">
        {events.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-paper-subtle border border-rule flex items-center justify-center mx-auto mb-3 text-ink-muted">
              <Info className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-sm font-bold text-ink-primary mb-1">
              在此條件下無相符活動
            </h4>
            <p className="text-xs text-ink-muted max-w-xs mx-auto mb-4">
              您可以嘗試清除日期、地區或分類限制，或在上方搜尋欄更改關鍵字。
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-ink-primary text-paper-card hover:bg-ink-secondary transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清除所有篩選條件</span>
              </button>
            )}
          </div>
        ) : (
          events.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            const timeDisplay = formatTaipeiDateTime(ev.startsAt, ev.endsAt, ev.allDay);

            return (
              <div
                key={ev.id}
                role="article"
                tabIndex={0}
                onClick={() => onSelectEvent(isSelected ? null : ev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectEvent(isSelected ? null : ev);
                  }
                }}
                className={`p-3.5 rounded transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-ochre-light/40 border-ochre shadow-sm ring-1 ring-ochre/30"
                    : "bg-paper-card border-rule/70 hover:border-rule-dark hover:bg-paper hover:shadow-editorial"
                }`}
              >
                {/* Header: Category & City & Provenance Badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-ink-primary text-paper-card">
                      {ev.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-ink-secondary font-medium font-serif">
                      <MapPin className="w-3 h-3 text-ochre" />
                      <span>{ev.city}</span>
                    </span>
                    {ev.venue && (
                      <span className="text-xs text-ink-muted truncate max-w-[160px]">
                        · {ev.venue}
                      </span>
                    )}
                  </div>

                  {/* Provenance Tag: Demo vs Live Verified */}
                  <div>
                    {ev.source.isDemo ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-paper-muted text-ink-muted border border-rule font-mono">
                        <Sparkles className="w-2.5 h-2.5 text-ochre" />
                        <span>展示資料 (Demo)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-ink-primary/10 text-ink-primary border border-ink-primary/20 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5 text-ink-primary" />
                        <span>即時開放資料</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-serif text-sm sm:text-base font-bold text-ink-primary leading-snug hover:text-ochre transition-colors mb-2">
                  {ev.title}
                </h4>

                {/* Date & Time */}
                <div className="flex items-center gap-1.5 text-xs text-ink-secondary font-mono mb-2">
                  <Calendar className="w-3.5 h-3.5 text-ochre shrink-0" />
                  <span>{timeDisplay}</span>
                </div>

                {/* Description snippet */}
                {ev.description && (
                  <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-2.5 font-sans">
                    {ev.description}
                  </p>
                )}

                {/* Footer: Price & Source Provenance & External Link */}
                <div className="pt-2 border-t border-rule/60 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    {ev.priceText && (
                      <span className="flex items-center gap-1 text-[11px] text-ink-secondary font-mono bg-paper px-2 py-0.5 rounded border border-rule">
                        <Tag className="w-3 h-3 text-ink-muted" />
                        <span>{ev.priceText}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-ink-muted font-sans">
                      來源：{ev.source.name}
                    </span>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-ochre hover:text-ochre-hover hover:underline font-medium min-h-[32px] px-1"
                      >
                        <span>活動官網</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
