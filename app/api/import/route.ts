import { NextRequest, NextResponse } from "next/server";
import { parseAndValidateEventsJson } from "@/lib/events/normalize";
import { eventStore } from "@/lib/events/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = parseAndValidateEventsJson(body, {
      name: "本地上傳 JSON (Local Upload)",
      fetchedAt: new Date().toISOString(),
      isDemo: false,
    });

    if (result.validEvents.length > 0) {
      const storeRes = eventStore.addEvents(result.validEvents);
      return NextResponse.json({
        success: true,
        importedCount: result.validEvents.length,
        rejectedCount: result.rejectedCount,
        newTotal: storeRes.total,
        errors: result.errors,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "未發現任何符合規範的活動資料，請檢視格式與必填欄位",
          rejectedCount: result.rejectedCount,
          errors: result.errors,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "解析上傳資料失敗",
      },
      { status: 400 }
    );
  }
}
