import { describe, it, expect } from "vitest";
import {
  getRolling30DayWindow,
  isEventInWindow,
  isEventOnDate,
  filterEvents,
  calculateCityEventCounts,
  calculateDateEventCounts,
} from "../lib/events/filter";
import { getDemoEvents } from "../lib/events/demo";
import { Event } from "../lib/events/types";

describe("Event Window & Filtering", () => {
  const baseDate = new Date("2026-09-12T10:00:00+08:00");
  const window = getRolling30DayWindow(baseDate);

  it("calculates rolling 30-day window correctly in Asia/Taipei", () => {
    expect(window.startDateStr).toBe("2026-09-12");
    expect(window.endDateStr).toBe("2026-10-12");
    expect(window.days).toBe(30);
  });

  it("accurately detects if events are inside or outside the 30-day window", () => {
    const withinEvent: Event = {
      id: "in-1",
      title: "近期活動",
      startsAt: "2026-09-15T14:00:00+08:00",
      category: "音樂",
      city: "臺北市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
      updatedAt: "2026-09-12",
    };

    const pastEvent: Event = {
      id: "past-1",
      title: "過期活動",
      startsAt: "2026-08-10T14:00:00+08:00",
      category: "音樂",
      city: "臺北市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
      updatedAt: "2026-09-12",
    };

    const futureEvent: Event = {
      id: "future-1",
      title: "遠期活動",
      startsAt: "2026-11-20T14:00:00+08:00",
      category: "展覽",
      city: "高雄市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
      updatedAt: "2026-09-12",
    };

    expect(isEventInWindow(withinEvent, window)).toBe(true);
    expect(isEventInWindow(pastEvent, window)).toBe(false);
    expect(isEventInWindow(futureEvent, window)).toBe(false);
  });

  it("handles multi-day events that span into the window", () => {
    // Event started before window, ends inside window
    const multiDayEvent: Event = {
      id: "multi-1",
      title: "跨週藝術季",
      startsAt: "2026-09-08T09:00:00+08:00",
      endsAt: "2026-09-16T18:00:00+08:00",
      category: "展覽",
      city: "臺中市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
      updatedAt: "2026-09-12",
    };

    expect(isEventInWindow(multiDayEvent, window)).toBe(true);
    expect(isEventOnDate(multiDayEvent, "2026-09-12")).toBe(true);
    expect(isEventOnDate(multiDayEvent, "2026-09-15")).toBe(true);
    expect(isEventOnDate(multiDayEvent, "2026-09-20")).toBe(false);
  });

  it("filters demo events by category, city, and date", () => {
    const demoEvents = getDemoEvents(baseDate);

    // Initial filter: all events inside window (should be at least 20, excludes 2 out-of-window demo items)
    const windowEvents = filterEvents(demoEvents, { category: "all", city: "all" }, window);
    expect(windowEvents.length).toBeGreaterThanOrEqual(20);

    // Filter by category: 音樂
    const musicEvents = filterEvents(demoEvents, { category: "音樂", city: "all" }, window);
    expect(musicEvents.length).toBeGreaterThan(0);
    expect(musicEvents.every((e) => e.category === "音樂")).toBe(true);

    // Filter by city: 臺北市
    const tpeEvents = filterEvents(demoEvents, { category: "all", city: "臺北市" }, window);
    expect(tpeEvents.length).toBeGreaterThan(0);
    expect(tpeEvents.every((e) => e.city === "臺北市")).toBe(true);

    // Filter by date
    const todayStr = "2026-09-12";
    const todayEvents = filterEvents(demoEvents, { category: "all", city: "all", selectedDate: todayStr }, window);
    expect(todayEvents.length).toBeGreaterThanOrEqual(1);

    // Search query filter
    const searchEvents = filterEvents(demoEvents, { category: "all", city: "all", searchQuery: "工藝" }, window);
    expect(searchEvents.length).toBeGreaterThanOrEqual(1);
    expect(searchEvents[0].title).toContain("工藝");
  });

  it("correctly calculates event aggregations for map and calendar", () => {
    const demoEvents = getDemoEvents(baseDate);
    const windowEvents = filterEvents(demoEvents, { category: "all", city: "all" }, window);

    const cityCounts = calculateCityEventCounts(windowEvents);
    expect(cityCounts["臺北市"]).toBeGreaterThanOrEqual(1);
    expect(cityCounts["高雄市"]).toBeGreaterThanOrEqual(1);

    const dateCounts = calculateDateEventCounts(windowEvents);
    expect(dateCounts["2026-09-12"]).toBeGreaterThanOrEqual(1);
  });
});
