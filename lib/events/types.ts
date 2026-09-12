export const EVENT_CATEGORIES = [
  "親子",
  "音樂",
  "展覽",
  "表演",
  "戶外",
  "講座",
  "節慶",
  "市集",
  "運動",
  "其他",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface EventSource {
  name: string;
  url?: string;
  fetchedAt: string;
  isDemo: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startsAt: string; // ISO with timezone (e.g., 2026-09-12T14:00:00+08:00)
  endsAt?: string;
  allDay?: boolean;
  category: EventCategory;
  city: string; // Canonical Taiwan city/county (e.g. 臺北市, 高雄市)
  county?: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  url?: string;
  priceText?: string;
  source: EventSource;
  updatedAt: string;
}

export interface EventFilterState {
  category?: EventCategory | "all";
  city?: string | "all";
  selectedDate?: string | null; // YYYY-MM-DD
  searchQuery?: string;
  sourceMode?: "all" | "demo" | "live";
}

export interface DateWindow {
  start: Date;
  end: Date;
  startDateStr: string; // YYYY-MM-DD in Asia/Taipei
  endDateStr: string;   // YYYY-MM-DD in Asia/Taipei
  days: number;
}
