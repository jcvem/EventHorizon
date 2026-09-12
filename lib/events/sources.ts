import { Event, EventCategory } from "./types";
import { getDemoEvents } from "./demo";
import { validateAndNormalizeEvent, deduplicateEvents } from "./normalize";

export interface EventSourceAdapter {
  id: string;
  name: string;
  description: string;
  isLive: boolean;
  fetchEvents(): Promise<{ events: Event[]; warnings: string[] }>;
}

/**
 * 1. Deterministic Local Demo Seed Adapter
 */
export class DemoSourceAdapter implements EventSourceAdapter {
  id = "demo-seed";
  name = "展示種子資料 (Demo Seed)";
  description = "全臺涵蓋22縣市與10大主題分類之展示測試資料集，已標記為展示用。";
  isLive = false;

  async fetchEvents(): Promise<{ events: Event[]; warnings: string[] }> {
    const events = getDemoEvents();
    return {
      events,
      warnings: [],
    };
  }
}

/**
 * 2. Ministry of Culture (文化部) Open Data Adapter
 * Verified live endpoint: https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6
 */
export class MinistryOfCultureAdapter implements EventSourceAdapter {
  id = "tw-moc-opendata";
  name = "文化部全國藝文活動開放資料";
  description = "中華民國文化部公開資料庫（展覽與藝文演出活動），即時資料來源。";
  isLive = true;

  private endpoint = "https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6";

  async fetchEvents(timeoutMs = 6000): Promise<{ events: Event[]; warnings: string[] }> {
    const warnings: string[] = [];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "EventsHorizon-Taiwan/1.0",
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`文化部開放資料伺服器回應異常 HTTP ${response.status}`);
      }

      const rawList = await response.json();
      if (!Array.isArray(rawList)) {
        throw new Error("文化部開放資料格式非預期之陣列格式");
      }

      const fetchedAt = new Date().toISOString();
      const events: Event[] = [];

      for (const item of rawList) {
        const show = item.showInfo && item.showInfo[0] ? item.showInfo[0] : null;
        if (!show || !show.time) continue;

        // Extract dates and location
        const rawTime = show.time.replace(/\//g, "-");
        const rawEndTime = show.endTime ? show.endTime.replace(/\//g, "-") : undefined;

        const rawEvent = {
          id: `moc-${item.UID || Math.random().toString(36).slice(2, 9)}`,
          title: item.title,
          description: item.descriptionFilterHtml,
          startsAt: rawTime,
          endsAt: rawEndTime,
          category: "展覽" as EventCategory,
          city: show.location || "臺灣",
          venue: show.locationName,
          latitude: show.latitude ? parseFloat(show.latitude) : undefined,
          longitude: show.longitude ? parseFloat(show.longitude) : undefined,
          priceText: show.price || (show.onSales === "Y" ? "售票活動" : "免費/未提供"),
          url: item.webSales || item.sourceWebPromote || undefined,
          source: {
            name: "文化部全國藝文開放資料",
            url: "https://cloud.culture.tw",
            fetchedAt,
            isDemo: false,
          },
        };

        const result = validateAndNormalizeEvent(rawEvent);
        if (result.isValid && result.event) {
          events.push(result.event);
        }
      }

      const deduped = deduplicateEvents(events);
      return { events: deduped, warnings };
    } catch (err: any) {
      clearTimeout(timer);
      const msg = err.name === "AbortError" ? "文化部開放資料連線逾時" : (err.message || String(err));
      warnings.push(`即時資料獲取未成功 (${msg})，已無縫維持本地離線資料。`);
      return { events: [], warnings };
    }
  }
}

/**
 * Registry of adapters
 */
export const availableAdapters: Record<string, EventSourceAdapter> = {
  demo: new DemoSourceAdapter(),
  moc: new MinistryOfCultureAdapter(),
};
