import { Event, EventFilterState, DateWindow } from "./types";
import { getTaipeiDateString } from "./normalize";

/**
 * Computes rolling next 30 days date window in Asia/Taipei timezone.
 */
export function getRolling30DayWindow(referenceDate: Date = new Date()): DateWindow {
  // Convert referenceDate to Taipei midnight (00:00:00.000)
  const utc = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const taipeiNow = new Date(utc + 8 * 3600000);

  const startYear = taipeiNow.getFullYear();
  const startMonth = taipeiNow.getMonth();
  const startDateNum = taipeiNow.getDate();

  // 00:00:00 of today
  const start = new Date(Date.UTC(startYear, startMonth, startDateNum, 0 - 8, 0, 0, 0));

  // 23:59:59.999 of day + 30
  const end = new Date(Date.UTC(startYear, startMonth, startDateNum + 30, 23 - 8, 59, 59, 999));

  const startDateStr = getTaipeiDateString(start);
  const endDateStr = getTaipeiDateString(end);

  return {
    start,
    end,
    startDateStr,
    endDateStr,
    days: 30,
  };
}

/**
 * Checks whether an event overlaps the given date window.
 */
export function isEventInWindow(event: Event, window: DateWindow): boolean {
  try {
    const eventStart = new Date(event.startsAt).getTime();
    if (isNaN(eventStart)) return false;

    const eventEnd = event.endsAt ? new Date(event.endsAt).getTime() : eventStart;
    const windowStart = window.start.getTime();
    const windowEnd = window.end.getTime();

    // Overlap: event starts before window ends, and ends after window starts
    return eventStart <= windowEnd && eventEnd >= windowStart;
  } catch {
    return false;
  }
}

/**
 * Checks whether an event occurs on a specific target date (YYYY-MM-DD in Asia/Taipei).
 */
export function isEventOnDate(event: Event, targetDateStr: string): boolean {
  if (!targetDateStr) return true;

  try {
    const startDateStr = getTaipeiDateString(event.startsAt);
    if (startDateStr === targetDateStr) return true;

    if (event.endsAt) {
      const endDateStr = getTaipeiDateString(event.endsAt);
      return targetDateStr >= startDateStr && targetDateStr <= endDateStr;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Filters a list of events according to the active filter state and rolling window.
 */
export function filterEvents(
  events: Event[],
  filters: EventFilterState,
  window: DateWindow = getRolling30DayWindow()
): Event[] {
  return events
    .filter((ev) => {
      // 1. Must be in rolling 30-day window
      if (!isEventInWindow(ev, window)) {
        return false;
      }

      // 2. Category filter
      if (filters.category && filters.category !== "all") {
        if (ev.category !== filters.category) return false;
      }

      // 3. City filter
      if (filters.city && filters.city !== "all") {
        if (ev.city !== filters.city) return false;
      }

      // 4. Specific date filter
      if (filters.selectedDate) {
        if (!isEventOnDate(ev, filters.selectedDate)) return false;
      }

      // 5. Source mode filter (demo vs live)
      if (filters.sourceMode === "demo" && !ev.source.isDemo) return false;
      if (filters.sourceMode === "live" && ev.source.isDemo) return false;

      // 6. Search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description ? ev.description.toLowerCase().includes(q) : false;
        const matchVenue = ev.venue ? ev.venue.toLowerCase().includes(q) : false;
        const matchCity = ev.city.toLowerCase().includes(q);
        const matchCat = ev.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchVenue && !matchCity && !matchCat) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const timeDiff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.title.localeCompare(b.title, "zh-Hant");
    });
}

/**
 * Aggregates event counts by city for map markers given currently active non-city filters.
 */
export function calculateCityEventCounts(events: Event[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ev of events) {
    counts[ev.city] = (counts[ev.city] || 0) + 1;
  }
  return counts;
}

/**
 * Aggregates event counts by date (YYYY-MM-DD) for calendar cells.
 */
export function calculateDateEventCounts(events: Event[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ev of events) {
    const startDateStr = getTaipeiDateString(ev.startsAt);
    if (startDateStr) {
      counts[startDateStr] = (counts[startDateStr] || 0) + 1;
    }
  }
  return counts;
}
