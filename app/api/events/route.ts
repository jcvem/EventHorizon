import { NextRequest, NextResponse } from "next/server";
import { eventStore } from "@/lib/events/storage";
import { filterEvents, getRolling30DayWindow } from "@/lib/events/filter";
import { availableAdapters } from "@/lib/events/sources";
import { EventCategory } from "@/lib/events/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceParam = searchParams.get("source");
    const categoryParam = searchParams.get("category");
    const cityParam = searchParams.get("city");
    const dateParam = searchParams.get("date");
    const queryParam = searchParams.get("search");

    let warning: string | undefined;

    // If caller requests Ministry of Culture live open data
    if (sourceParam === "moc") {
      const mocAdapter = availableAdapters.moc;
      if (mocAdapter) {
        const fetchRes = await mocAdapter.fetchEvents();
        if (fetchRes.events.length > 0) {
          eventStore.addEvents(fetchRes.events);
        }
        if (fetchRes.warnings.length > 0) {
          warning = fetchRes.warnings.join("; ");
        }
      }
    }

    const allEvents = eventStore.getAll();
    const dateWindow = getRolling30DayWindow();

    const filtered = filterEvents(
      allEvents,
      {
        category: (categoryParam as EventCategory) || "all",
        city: cityParam || "all",
        selectedDate: dateParam || null,
        searchQuery: queryParam || "",
        sourceMode: sourceParam === "demo" ? "demo" : sourceParam === "live" ? "live" : "all",
      },
      dateWindow
    );

    return NextResponse.json({
      success: true,
      window: {
        startDate: dateWindow.startDateStr,
        endDate: dateWindow.endDateStr,
        timezone: "Asia/Taipei",
      },
      totalStored: allEvents.length,
      count: filtered.length,
      events: filtered,
      warning,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "讀取活動清單失敗",
      },
      { status: 500 }
    );
  }
}
