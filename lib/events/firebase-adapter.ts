import { EventSourceAdapter } from "./sources";
import { Event, EventCategory } from "./types";
import { validateAndNormalizeEvent, deduplicateEvents } from "./normalize";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, query, limit } from "firebase/firestore";

export class FirebaseSourceAdapter implements EventSourceAdapter {
  id = "joecalendar-firestore";
  name = "Firebase Firestore (joecalendar-e8327)";
  description = "專屬雲端資料庫 (joecalendar-e8327) 實時讀取與同步存取全臺藝文活動。";
  isLive = true;

  async fetchEvents(): Promise<{ events: Event[]; warnings: string[] }> {
    const warnings: string[] = [];
    const events: Event[] = [];

    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, limit(200));
      const snapshot = await getDocs(q);

      const fetchedAt = new Date().toISOString();

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        const rawEvent = {
          id: raw.id || docSnap.id,
          title: raw.title,
          description: raw.description,
          startsAt: raw.startsAt,
          endsAt: raw.endsAt || undefined,
          category: (raw.category || "展覽") as EventCategory,
          city: raw.city || "臺灣",
          venue: raw.venue,
          latitude: raw.latitude ? Number(raw.latitude) : undefined,
          longitude: raw.longitude ? Number(raw.longitude) : undefined,
          priceText: raw.priceText,
          url: raw.url,
          source: {
            name: "Firebase (joecalendar-e8327)",
            url: "https://console.firebase.google.com/project/joecalendar-e8327/firestore",
            fetchedAt,
            isDemo: false,
          },
        };

        const normalized = validateAndNormalizeEvent(rawEvent);
        if (normalized.isValid && normalized.event) {
          events.push(normalized.event);
        }
      });

      const deduped = deduplicateEvents(events);
      return { events: deduped, warnings };
    } catch (err: any) {
      const msg = err.message || String(err);
      warnings.push(`Firebase 雲端資料庫讀取異常 (${msg})。請確認 .env.local 密鑰與 Firestore 安全規則。`);
      return { events: [], warnings };
    }
  }

  /**
   * Sync/save events into joecalendar-e8327 Firestore db
   */
  async saveEvents(eventsToSave: Event[]): Promise<{ count: number; warnings: string[] }> {
    const warnings: string[] = [];
    let count = 0;

    for (const ev of eventsToSave) {
      try {
        const docRef = doc(db, "events", ev.id);
        await setDoc(
          docRef,
          {
            id: ev.id,
            title: ev.title,
            description: ev.description || "",
            startsAt: ev.startsAt,
            endsAt: ev.endsAt || null,
            category: ev.category,
            city: ev.city,
            venue: ev.venue || "",
            latitude: ev.latitude || null,
            longitude: ev.longitude || null,
            priceText: ev.priceText || "",
            url: ev.url || "",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      } catch (err: any) {
        warnings.push(`儲存 "${ev.title}" 至 Firestore 失敗: ${err.message}`);
      }
    }

    return { count, warnings };
  }
}
