"use client";

import React from "react";
import { Event } from "@/lib/events/types";
import { formatTaipeiDateTime } from "@/lib/events/normalize";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  ShieldCheck,
  Building,
  Info,
} from "lucide-react";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  const timeDisplay = formatTaipeiDateTime(event.startsAt, event.endsAt, event.allDay);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-paper-card border border-rule rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-rule bg-paper-subtle/80 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-ink-primary text-paper-card">
                {event.category}
              </span>
              <span className="text-xs text-ochre font-bold flex items-center gap-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {event.city}
              </span>
            </div>
            <h3 id="modal-title" className="font-serif text-lg sm:text-xl font-bold text-ink-primary leading-tight">
              {event.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉活動視窗"
            className="p-1.5 rounded text-ink-muted hover:text-ink-primary hover:bg-paper-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-ink-primary">
          {/* Key metadata grid */}
          <div className="grid grid-cols-1 gap-2.5 bg-paper p-3 rounded border border-rule">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-ink-muted block">時間 (Asia/Taipei)</span>
                <span className="font-mono text-xs font-medium text-ink-primary">{timeDisplay}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-ink-muted block">地點 / 場館</span>
                <span className="text-xs font-medium text-ink-primary">
                  {event.city} {event.venue ? `· ${event.venue}` : ""}
                </span>
              </div>
            </div>

            {event.priceText && (
              <div className="flex items-start gap-2.5">
                <Tag className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-ink-muted block">票價資訊</span>
                  <span className="font-mono text-xs font-medium text-ink-primary">{event.priceText}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-xs font-serif font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                活動詳情與簡介
              </h4>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line bg-paper-subtle/40 p-3 rounded border border-rule/50">
                {event.description}
              </p>
            </div>
          )}

          {/* Source Provenance Box */}
          <div className="p-3 rounded border border-rule bg-paper text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-ink-primary">
              <ShieldCheck className="w-4 h-4 text-ochre" />
              <span>資料來源與履歷</span>
            </div>
            <div className="text-[11px] text-ink-secondary space-y-0.5 font-mono">
              <div>來源名稱：{event.source.name}</div>
              <div>資料性質：{event.source.isDemo ? "展示用測試種子（已明確標註）" : "公部門即時開放資料驗證來源"}</div>
              <div>擷取時間：{event.source.fetchedAt}</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-rule bg-paper-subtle flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-ink-secondary hover:text-ink-primary hover:bg-paper-muted rounded border border-rule transition-colors min-h-[44px]"
          >
            返回列表
          </button>

          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded bg-ochre hover:bg-ochre-hover text-white shadow-sm transition-colors min-h-[44px]"
            >
              <span>前往活動官方網站</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-ink-muted flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>此活動未提供外部官方網址</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
