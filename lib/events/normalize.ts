import { Event, EventCategory, EVENT_CATEGORIES } from "./types";
import { canonicalizeCityName } from "../map/taiwan";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  event?: Event;
}

/**
 * Ensures a date string is parsed and represented with Asia/Taipei offset (+08:00).
 */
export function normalizeDateToTaipeiISO(rawDate: string | Date | number): string {
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) {
    throw new Error(`無效的日期格式: ${rawDate}`);
  }

  // Calculate Asia/Taipei (UTC+8) time components
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const taipeiTime = new Date(utc + 8 * 3600000);

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = taipeiTime.getFullYear();
  const month = pad(taipeiTime.getMonth() + 1);
  const day = pad(taipeiTime.getDate());
  const hours = pad(taipeiTime.getHours());
  const mins = pad(taipeiTime.getMinutes());
  const secs = pad(taipeiTime.getSeconds());

  return `${year}-${month}-${day}T${hours}:${mins}:${secs}+08:00`;
}

/**
 * Returns date in YYYY-MM-DD string in Asia/Taipei timezone.
 */
export function getTaipeiDateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const taipeiTime = new Date(utc + 8 * 3600000);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${taipeiTime.getFullYear()}-${pad(taipeiTime.getMonth() + 1)}-${pad(taipeiTime.getDate())}`;
}

/**
 * Human-friendly Chinese formatting of date and time.
 * e.g. "9月15日 (二) 14:00" or "9月15日 全天"
 */
export function formatTaipeiDateTime(isoString: string, endsAtIso?: string, allDay?: boolean): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const t = new Date(utc + 8 * 3600000);

    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    const month = t.getMonth() + 1;
    const date = t.getDate();
    const dayName = weekDays[t.getDay()];
    const pad = (n: number) => String(n).padStart(2, "0");
    const timeStr = `${pad(t.getHours())}:${pad(t.getMinutes())}`;

    if (allDay) {
      return `${month}月${date}日 (${dayName}) 全天`;
    }

    if (endsAtIso) {
      const endD = new Date(endsAtIso);
      if (!isNaN(endD.getTime())) {
        const endUtc = endD.getTime() + endD.getTimezoneOffset() * 60000;
        const endT = new Date(endUtc + 8 * 3600000);
        if (endT.toDateString() === t.toDateString()) {
          const endTimeStr = `${pad(endT.getHours())}:${pad(endT.getMinutes())}`;
          return `${month}月${date}日 (${dayName}) ${timeStr}–${endTimeStr}`;
        } else {
          const endMonth = endT.getMonth() + 1;
          const endDate = endT.getDate();
          return `${month}月${date}日 (${dayName}) – ${endMonth}月${endDate}日`;
        }
      }
    }

    return `${month}月${date}日 (${dayName}) ${timeStr}`;
  } catch {
    return isoString;
  }
}

/**
 * Validates category against allowed list or normalizes to "其他".
 */
export function normalizeCategory(raw: unknown): EventCategory {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (EVENT_CATEGORIES.includes(trimmed as EventCategory)) {
      return trimmed as EventCategory;
    }
    // Mapping common synonyms
    if (trimmed.includes("樂") || trimmed.includes("歌") || trimmed.includes("聲") || trimmed.includes("演唱")) return "音樂";
    if (trimmed.includes("展")) return "展覽";
    if (trimmed.includes("親") || trimmed.includes("童") || trimmed.includes("兒") || trimmed.includes("家庭")) return "親子";
    if (trimmed.includes("劇") || trimmed.includes("戲") || trimmed.includes("舞") || trimmed.includes("演藝")) return "表演";
    if (trimmed.includes("步道") || trimmed.includes("山") || trimmed.includes("海") || trimmed.includes("露營") || trimmed.includes("生態")) return "戶外";
    if (trimmed.includes("講") || trimmed.includes("研討") || trimmed.includes("分享") || trimmed.includes("工作坊")) return "講座";
    if (trimmed.includes("季") || trimmed.includes("節") || trimmed.includes("慶")) return "節慶";
    if (trimmed.includes("市集") || trimmed.includes("農夫") || trimmed.includes("手作")) return "市集";
    if (trimmed.includes("跑") || trimmed.includes("球") || trimmed.includes("賽") || trimmed.includes("單車") || trimmed.includes("馬拉松")) return "運動";
  }
  return "其他";
}

/**
 * Validates and normalizes an untrusted raw event object.
 */
export function validateAndNormalizeEvent(raw: any, fallbackSource?: Event["source"]): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { isValid: false, errors: ["活動資料必須是物件"] };
  }

  // Title
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) {
    errors.push("缺少活動名稱 (title)");
  }

  // StartsAt
  let startsAt = "";
  const rawStart = raw.startsAt || raw.startDate || raw.time || raw.start;
  if (!rawStart) {
    errors.push("缺少開始時間 (startsAt)");
  } else {
    try {
      startsAt = normalizeDateToTaipeiISO(rawStart);
    } catch (e: any) {
      errors.push(`開始時間格式錯誤: ${e.message}`);
    }
  }

  // EndsAt
  let endsAt: string | undefined;
  const rawEnd = raw.endsAt || raw.endDate || raw.endTime || raw.end;
  if (rawEnd) {
    try {
      endsAt = normalizeDateToTaipeiISO(rawEnd);
    } catch {
      // Non-fatal, just ignore invalid end date
      endsAt = undefined;
    }
  }

  // City
  const rawCity = raw.city || raw.location || raw.county || raw.address;
  const city = canonicalizeCityName(rawCity);
  if (!city || city === "其他") {
    if (!raw.city && !raw.location) {
      errors.push("缺少縣市或地點資訊 (city/location)");
    }
  }

  // Category
  const category = normalizeCategory(raw.category);

  // Source
  const source = raw.source && typeof raw.source === "object"
    ? {
        name: String(raw.source.name || fallbackSource?.name || "未知來源"),
        url: raw.source.url ? String(raw.source.url) : fallbackSource?.url,
        fetchedAt: String(raw.source.fetchedAt || fallbackSource?.fetchedAt || new Date().toISOString()),
        isDemo: Boolean(raw.source.isDemo ?? fallbackSource?.isDemo ?? false),
      }
    : (fallbackSource || {
        name: "本地匯入 (Local Import)",
        fetchedAt: new Date().toISOString(),
        isDemo: false,
      });

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Generate stable ID if missing
  const id = raw.id && typeof raw.id === "string" && raw.id.trim()
    ? raw.id.trim()
    : `evt-${encodeURIComponent(title.slice(0, 12))}-${startsAt.slice(0, 10)}-${city}`;

  const event: Event = {
    id,
    title,
    description: typeof raw.description === "string" ? raw.description.trim() : undefined,
    startsAt,
    endsAt,
    allDay: Boolean(raw.allDay),
    category,
    city,
    county: typeof raw.county === "string" ? raw.county : undefined,
    venue: typeof raw.venue === "string" ? raw.venue.trim() : (raw.locationName ? String(raw.locationName) : undefined),
    latitude: typeof raw.latitude === "number" ? raw.latitude : (raw.latitude ? parseFloat(raw.latitude) || undefined : undefined),
    longitude: typeof raw.longitude === "number" ? raw.longitude : (raw.longitude ? parseFloat(raw.longitude) || undefined : undefined),
    imageUrl: typeof raw.imageUrl === "string" && raw.imageUrl.startsWith("http") ? raw.imageUrl : undefined,
    url: typeof raw.url === "string" && raw.url.startsWith("http") ? raw.url : undefined,
    priceText: typeof raw.priceText === "string" ? raw.priceText.trim() : (raw.price ? String(raw.price) : undefined),
    source,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : new Date().toISOString(),
  };

  return { isValid: true, errors: [], event };
}

/**
 * Deduplicates events list based on ID or canonical title + date + city.
 */
export function deduplicateEvents(events: Event[]): Event[] {
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const result: Event[] = [];

  for (const ev of events) {
    if (seenIds.has(ev.id)) continue;

    // Normalizing signature: title + date + city
    const dateKey = ev.startsAt.slice(0, 10);
    const sig = `${ev.title.trim().toLowerCase()}::${dateKey}::${ev.city}`;
    if (seenSignatures.has(sig)) continue;

    seenIds.add(ev.id);
    seenSignatures.add(sig);
    result.push(ev);
  }

  return result;
}

/**
 * Parses user-uploaded JSON string or array, validates each item, and deduplicates.
 */
export function parseAndValidateEventsJson(input: unknown, defaultSource?: Event["source"]): {
  validEvents: Event[];
  rejectedCount: number;
  errors: { index: number; reasons: string[] }[];
} {
  let items: any[] = [];

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      items = Array.isArray(parsed) ? parsed : (parsed.events && Array.isArray(parsed.events) ? parsed.events : [parsed]);
    } catch {
      return {
        validEvents: [],
        rejectedCount: 1,
        errors: [{ index: 0, reasons: ["JSON 語法解析失敗，請確認是否為有效 JSON"] }],
      };
    }
  } else if (Array.isArray(input)) {
    items = input;
  } else if (input && typeof input === "object") {
    items = Array.isArray((input as any).events) ? (input as any).events : [input];
  } else {
    return {
      validEvents: [],
      rejectedCount: 1,
      errors: [{ index: 0, reasons: ["輸入資料型態無效"] }],
    };
  }

  const validEvents: Event[] = [];
  const errors: { index: number; reasons: string[] }[] = [];

  items.forEach((item, index) => {
    const res = validateAndNormalizeEvent(item, defaultSource);
    if (res.isValid && res.event) {
      validEvents.push(res.event);
    } else {
      errors.push({ index, reasons: res.errors });
    }
  });

  const deduped = deduplicateEvents(validEvents);

  return {
    validEvents: deduped,
    rejectedCount: errors.length,
    errors,
  };
}
