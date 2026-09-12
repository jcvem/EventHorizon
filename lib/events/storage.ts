import { Event } from "./types";
import { getDemoEvents } from "./demo";
import { deduplicateEvents } from "./normalize";

class EventStore {
  private events: Map<string, Event> = new Map();
  private initialized = false;

  constructor() {
    this.initDefault();
  }

  public initDefault(force = false) {
    if (this.initialized && !force) return;
    this.events.clear();
    const demoEvents = getDemoEvents();
    for (const ev of demoEvents) {
      this.events.set(ev.id, ev);
    }
    this.initialized = true;
  }

  public getAll(): Event[] {
    return Array.from(this.events.values());
  }

  public getById(id: string): Event | undefined {
    return this.events.get(id);
  }

  public addEvents(newEvents: Event[]): { added: number; total: number } {
    const existing = this.getAll();
    const merged = deduplicateEvents([...newEvents, ...existing]);
    this.events.clear();
    for (const ev of merged) {
      this.events.set(ev.id, ev);
    }
    return {
      added: merged.length - existing.length,
      total: this.events.size,
    };
  }

  public resetToDemo(): void {
    this.initDefault(true);
  }
}

// Global singleton instance for the Node server runtime
const globalForEvents = globalThis as unknown as { eventStore?: EventStore };
export const eventStore = globalForEvents.eventStore || new EventStore();
if (process.env.NODE_ENV !== "production") globalForEvents.eventStore = eventStore;
