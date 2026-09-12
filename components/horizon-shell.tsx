"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Event, EventCategory, EventFilterState } from "@/lib/events/types";
import { getRolling30DayWindow, filterEvents, calculateCityEventCounts, calculateDateEventCounts } from "@/lib/events/filter";
import { TaiwanMap } from "./taiwan-map";
import { MonthCalendar } from "./month-calendar";
import { EventList } from "./event-list";
import { CategoryFilter } from "./category-filter";
import { EventDetailModal } from "./event-detail-modal";
import { ImportModal } from "./import-modal";
import {
  Compass,
  RotateCcw,
  Database,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";

interface HorizonShellProps {
  initialEvents: Event[];
}

export const HorizonShell: React.FC<HorizonShellProps> = ({ initialEvents }) => {
  // Master event pool
  const [allEvents, setAllEvents] = useState<Event[]>(initialEvents);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected event for detail dialog
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 30-day window
  const dateWindow = useMemo(() => getRolling30DayWindow(), []);

  // Synchronized Filter State
  const [filters, setFilters] = useState<EventFilterState>({
    category: "all",
    city: "all",
    selectedDate: null,
    searchQuery: "",
    sourceMode: "all",
  });

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return filterEvents(allEvents, filters, dateWindow);
  }, [allEvents, filters, dateWindow]);

  // Aggregate counts for Map markers:
  // Show city counts reflecting active category + date + search filters (so map updates interactively)
  const cityCounts = useMemo(() => {
    const withoutCityFilter: EventFilterState = { ...filters, city: "all" };
    const baseForMap = filterEvents(allEvents, withoutCityFilter, dateWindow);
    return calculateCityEventCounts(baseForMap);
  }, [allEvents, filters, dateWindow]);

  // Aggregate counts for Calendar dates:
  // Show date counts reflecting active category + city + search filters
  const dateCounts = useMemo(() => {
    const withoutDateFilter: EventFilterState = { ...filters, selectedDate: null };
    const baseForCalendar = filterEvents(allEvents, withoutDateFilter, dateWindow);
    return calculateDateEventCounts(baseForCalendar);
  }, [allEvents, filters, dateWindow]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of allEvents) {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    }
    return counts;
  }, [allEvents]);

  // Filter change handlers
  const handleSelectCategory = useCallback((cat: EventCategory | "all") => {
    setFilters((prev) => ({ ...prev, category: cat }));
  }, []);

  const handleSelectCity = useCallback((city: string | "all") => {
    setFilters((prev) => ({ ...prev, city }));
  }, []);

  const handleSelectDate = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      category: "all",
      city: "all",
      selectedDate: null,
      searchQuery: "",
      sourceMode: "all",
    });
    setSelectedEvent(null);
  }, []);

  const handleSelectEvent = useCallback((event: Event | null) => {
    setSelectedEvent(event);
    if (event) {
      // Synchronize city if selected from list
      setFilters((prev) => ({
        ...prev,
        city: event.city,
      }));
    }
  }, []);

  // Source & Import handlers
  const handleImportEvents = useCallback((newEvents: Event[]) => {
    setAllEvents((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const filteredNew = newEvents.filter((e) => !existingIds.has(e.id));
      return [...filteredNew, ...prev];
    });
  }, []);

  const handleResetToDemo = useCallback(() => {
    setAllEvents(initialEvents);
    handleResetFilters();
  }, [initialEvents, handleResetFilters]);

  const handleFetchLiveCultureData = useCallback(async () => {
    setIsFetchingLive(true);
    try {
      const res = await fetch("/api/events?source=moc");
      const data = await res.json();
      if (res.ok && data.events && data.events.length > 0) {
        handleImportEvents(data.events);
        return {
          success: true,
          count: data.events.length,
          message: `成功連線文化部藝文活動資料庫，已載入 ${data.events.length} 筆最新展覽活動！`,
        };
      } else {
        return {
          success: false,
          count: 0,
          message: data.warning || "連線文化部 API 未能取得最新資料，已維持本地離線資料。",
        };
      }
    } catch {
      return {
        success: false,
        count: 0,
        message: "網路連線異常，無法連線文化部伺服器。",
      };
    } finally {
      setIsFetchingLive(false);
    }
  }, [handleImportEvents]);

  // Active filter summary labels for UI
  const activeFilterSummary = useMemo(() => {
    const labels: string[] = [];
    if (filters.category && filters.category !== "all") {
      labels.push(`分類：${filters.category}`);
    }
    if (filters.city && filters.city !== "all") {
      labels.push(`地區：${filters.city}`);
    }
    if (filters.selectedDate) {
      labels.push(`日期：${filters.selectedDate}`);
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      labels.push(`搜尋："${filters.searchQuery}"`);
    }
    return labels;
  }, [filters]);

  const hasActiveFilters = activeFilterSummary.length > 0;

  return (
    <div className="min-h-screen bg-paper text-ink-primary font-sans flex flex-col selection:bg-ochre-light selection:text-ink-primary">
      {/* Editorial Navigation Bar */}
      <header className="border-b border-rule bg-paper-card/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-ink-primary text-paper-card flex items-center justify-center font-serif font-bold text-lg shadow-sm border border-rule-dark">
              島
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-ink-primary">
                  EventsHorizon
                </h1>
                <span className="font-serif text-sm font-medium text-ink-secondary">
                  臺灣藝文視野
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-ochre-light text-ochre font-semibold border border-ochre-border">
                  未來 30 天 (Asia/Taipei)
                </span>
              </div>
              <p className="text-[11px] text-ink-muted hidden md:block">
                臺灣島嶼在地文化、音樂、展覽與戶外紀事 · 本地優先架構
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:flex items-center gap-1 text-xs text-ochre hover:bg-ochre-light px-2.5 py-1.5 rounded border border-ochre-border transition-colors font-medium min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設篩選</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs bg-paper-subtle hover:bg-paper-muted text-ink-primary border border-rule px-3 py-1.5 rounded transition-colors font-medium min-h-[36px]"
            >
              <Database className="w-3.5 h-3.5 text-ochre" />
              <span>資料來源與匯入</span>
            </button>
          </div>
        </div>
      </header>

      {/* Scope Banner & Category Filter Bar */}
      <section className="border-b border-rule bg-paper-subtle/60 py-3 px-4 sm:px-6">
        <div className="max-w-[1720px] mx-auto space-y-2.5">
          {/* Rolling Window & Info Tag */}
          <div className="flex flex-wrap items-center justify-between text-xs text-ink-secondary gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono text-[11px] bg-paper px-2 py-0.5 rounded border border-rule">
                <CalendarIcon className="w-3 h-3 text-ochre" />
                <span>{dateWindow.startDateStr} – {dateWindow.endDateStr}</span>
              </span>
              <span className="text-[11px] text-ink-muted">
                時區：臺灣標準時間 (UTC+8)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-ink-muted">
                <Sparkles className="w-3 h-3 text-ochre" />
                <span>展示模式：包含 26 筆確定性全臺示範活動</span>
              </span>
            </div>
          </div>

          {/* Category Chips Bar */}
          <CategoryFilter
            selectedCategory={filters.category || "all"}
            onSelectCategory={handleSelectCategory}
            categoryCounts={categoryCounts}
            totalCount={allEvents.length}
          />
        </div>
      </section>

      {/* Main 50/50 Desktop Split Layout / Mobile Stack Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
          {/* Left Panel (~50% Desktop): Interactive Taiwan Map */}
          <section
            aria-label="臺灣地理地圖"
            className="lg:col-span-6 flex flex-col min-h-[460px] lg:min-h-[700px]"
          >
            <TaiwanMap
              selectedCity={filters.city || "all"}
              onSelectCity={handleSelectCity}
              cityEventCounts={cityCounts}
              totalEventsCount={filteredEvents.length}
            />
          </section>

          {/* Right Panel (~50% Desktop): Month Calendar Top + Scrollable Event List Below */}
          <section
            aria-label="活動日曆與清單"
            className="lg:col-span-6 flex flex-col gap-4 min-h-[700px]"
          >
            {/* Calendar on Top */}
            <div className="shrink-0">
              <MonthCalendar
                dateWindow={dateWindow}
                selectedDate={filters.selectedDate || null}
                onSelectDate={handleSelectDate}
                dateEventCounts={dateCounts}
              />
            </div>

            {/* Scrollable Event List Below */}
            <div className="flex-1 min-h-[380px] lg:min-h-[420px] flex flex-col">
              <EventList
                events={filteredEvents}
                selectedEventId={selectedEvent?.id || null}
                onSelectEvent={handleSelectEvent}
                searchQuery={filters.searchQuery || ""}
                onSearchChange={handleSearchChange}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                activeFilterSummary={activeFilterSummary}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-rule bg-paper-card py-4 px-4 sm:px-6 text-xs text-ink-muted">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-ochre" />
            <span className="font-serif font-semibold text-ink-secondary">
              EventsHorizon · 臺灣藝文視野
            </span>
            <span>— 在地優先臺灣活動地圖指南</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>在地時間：Asia/Taipei (UTC+8)</span>
            <span>地圖向量依據 NLSC / OSM 開放資料規範標繪</span>
            <span>展示種子資料明確標註，無捏造現場活動</span>
          </div>
        </div>
      </footer>

      {/* Event Details Dialog Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Data Source & JSON Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportEvents={handleImportEvents}
        onResetToDemo={handleResetToDemo}
        onFetchLiveCultureData={handleFetchLiveCultureData}
        isFetchingLive={isFetchingLive}
      />
    </div>
  );
};
