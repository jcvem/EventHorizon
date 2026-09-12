import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaiwanMap } from "../components/taiwan-map";
import { CategoryFilter } from "../components/category-filter";
import { MonthCalendar } from "../components/month-calendar";
import { EventList } from "../components/event-list";
import { HorizonShell } from "../components/horizon-shell";
import { getRolling30DayWindow } from "../lib/events/filter";
import { getDemoEvents } from "../lib/events/demo";

describe("UI Smoke Tests", () => {
  const baseDate = new Date("2026-09-12T10:00:00+08:00");
  const demoEvents = getDemoEvents(baseDate);

  it("renders TaiwanMap with accessible markers and handles city clicks", () => {
    const handleSelectCity = vi.fn();
    render(
      <TaiwanMap
        selectedCity="all"
        onSelectCity={handleSelectCity}
        cityEventCounts={{ "臺北市": 3, "高雄市": 2 }}
        totalEventsCount={5}
      />
    );

    expect(screen.getByText("臺灣藝文探索地圖")).toBeInTheDocument();
    expect(screen.getByText("全臺目前活動：5 場")).toBeInTheDocument();

    // Check accessible role button for Taipei marker
    const taipeiMarker = screen.getByRole("button", { name: /臺北市: 3 場活動/i });
    expect(taipeiMarker).toBeInTheDocument();

    fireEvent.click(taipeiMarker);
    expect(handleSelectCity).toHaveBeenCalledWith("臺北市");
  });

  it("renders CategoryFilter chips with counts and handles category clicks", () => {
    const handleSelectCategory = vi.fn();
    render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={handleSelectCategory}
        categoryCounts={{ "音樂": 4, "展覽": 3 }}
        totalCount={7}
      />
    );

    expect(screen.getByText("主題領域分類")).toBeInTheDocument();
    expect(screen.getByText("全部分類")).toBeInTheDocument();

    const musicButton = screen.getByRole("button", { name: /音樂/i });
    expect(musicButton).toBeInTheDocument();

    fireEvent.click(musicButton);
    expect(handleSelectCategory).toHaveBeenCalledWith("音樂");
  });

  it("renders MonthCalendar with rolling 30-day scope and handles date selection", () => {
    const handleSelectDate = vi.fn();
    const dateWindow = getRolling30DayWindow(baseDate);

    render(
      <MonthCalendar
        dateWindow={dateWindow}
        selectedDate={null}
        onSelectDate={handleSelectDate}
        dateEventCounts={{ "2026-09-15": 2 }}
      />
    );

    expect(screen.getByText(/未來 30 天視窗/i)).toBeInTheDocument();

    const day15Button = screen.getByRole("button", { name: /2026-09-15, 2 場活動/i });
    expect(day15Button).toBeInTheDocument();

    fireEvent.click(day15Button);
    expect(handleSelectDate).toHaveBeenCalledWith("2026-09-15");
  });

  it("renders EventList with real event data, search, and provenance tags", () => {
    const handleSelectEvent = vi.fn();
    const handleReset = vi.fn();

    render(
      <EventList
        events={demoEvents.slice(0, 3)}
        selectedEventId={null}
        onSelectEvent={handleSelectEvent}
        searchQuery=""
        onSearchChange={vi.fn()}
        onResetFilters={handleReset}
        hasActiveFilters={false}
        activeFilterSummary={[]}
      />
    );

    expect(screen.getByText("活動行程冊")).toBeInTheDocument();
    expect(screen.getByText("共 3 場")).toBeInTheDocument();

    // Provenance badge
    const demoBadges = screen.getAllByText("展示資料 (Demo)");
    expect(demoBadges.length).toBeGreaterThan(0);

    // Event title
    expect(screen.getByText(demoEvents[0].title)).toBeInTheDocument();
  });

  it("synchronizes interactions across panels in HorizonShell", () => {
    render(<HorizonShell initialEvents={demoEvents} />);

    // Check title in navigation
    expect(screen.getByText("EventsHorizon")).toBeInTheDocument();
    expect(screen.getByText("臺灣藝文視野")).toBeInTheDocument();

    // Click on category chip: "音樂"
    const musicChip = screen.getByRole("button", { name: /音樂/i });
    fireEvent.click(musicChip);

    // Click on city marker: "臺北市"
    const tpeMarker = screen.getByRole("button", { name: /臺北市/i });
    fireEvent.click(tpeMarker);

    // Search bar typing
    const searchInput = screen.getByPlaceholderText(/搜尋活動名稱/i);
    fireEvent.change(searchInput, { target: { value: "弦" } });

    // Reset button should now be available in event list header
    const resetButtons = screen.getAllByRole("button", { name: /重設/i });
    expect(resetButtons.length).toBeGreaterThan(0);

    // Click reset
    fireEvent.click(resetButtons[0]);

    // Search query should be cleared
    expect((searchInput as HTMLInputElement).value).toBe("");
  });
});
