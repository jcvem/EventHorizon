import { describe, it, expect } from "vitest";
import {
  validateAndNormalizeEvent,
  normalizeDateToTaipeiISO,
  getTaipeiDateString,
  normalizeCategory,
  deduplicateEvents,
  parseAndValidateEventsJson,
} from "../lib/events/normalize";
import { canonicalizeCityName } from "../lib/map/taiwan";

describe("Event Normalization & Validation", () => {
  it("normalizes date to Asia/Taipei timezone (+08:00)", () => {
    // 2026-09-12 02:00:00 UTC is 2026-09-12 10:00:00 Asia/Taipei
    const utcIso = "2026-09-12T02:00:00.000Z";
    const taipeiIso = normalizeDateToTaipeiISO(utcIso);
    expect(taipeiIso).toBe("2026-09-12T10:00:00+08:00");

    const dateStr = getTaipeiDateString(utcIso);
    expect(dateStr).toBe("2026-09-12");
  });

  it("handles events that cross midnight into next day in Taipei", () => {
    // 2026-09-12 17:30:00 UTC is 2026-09-13 01:30:00 Asia/Taipei (+8h)
    const lateUtc = "2026-09-12T17:30:00.000Z";
    const taipeiIso = normalizeDateToTaipeiISO(lateUtc);
    expect(taipeiIso).toBe("2026-09-13T01:30:00+08:00");
    expect(getTaipeiDateString(lateUtc)).toBe("2026-09-13");
  });

  it("canonicalizes Taiwan city names with variant characters", () => {
    expect(canonicalizeCityName("台北市中正區")).toBe("臺北市");
    expect(canonicalizeCityName("台中草悟道")).toBe("臺中市");
    expect(canonicalizeCityName("台南市安平區")).toBe("臺南市");
    expect(canonicalizeCityName("高雄駁二")).toBe("高雄市");
    expect(canonicalizeCityName("馬祖南竿")).toBe("連江縣");
    expect(canonicalizeCityName("綠島柴口")).toBe("臺東縣");
    expect(canonicalizeCityName("未知區域")).toBe("其他");
  });

  it("normalizes categories and synonyms properly", () => {
    expect(normalizeCategory("音樂")).toBe("音樂");
    expect(normalizeCategory("爵士音樂會")).toBe("音樂");
    expect(normalizeCategory("當代陶藝展")).toBe("展覽");
    expect(normalizeCategory("親子捏陶趣")).toBe("親子");
    expect(normalizeCategory("現代舞蹈劇場")).toBe("表演");
    expect(normalizeCategory("合歡山生態健行")).toBe("戶外");
    expect(normalizeCategory("開源科技分享沙龍")).toBe("講座");
    expect(normalizeCategory("中秋提燈踩街節")).toBe("節慶");
    expect(normalizeCategory("文創手作市集")).toBe("市集");
    expect(normalizeCategory("半程馬拉松賽")).toBe("運動");
    expect(normalizeCategory("不知名項目")).toBe("其他");
  });

  it("validates required fields and reports errors for incomplete data", () => {
    // Missing title and startsAt
    const invalidRaw = {
      city: "臺北市",
    };
    const res = validateAndNormalizeEvent(invalidRaw);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain("缺少活動名稱 (title)");
    expect(res.errors).toContain("缺少開始時間 (startsAt)");
  });

  it("successfully normalizes a valid event with default source", () => {
    const raw = {
      title: "大稻埕散策走讀",
      startsAt: "2026-09-15T14:00:00+08:00",
      category: "講座",
      city: "台北市",
      venue: "大稻埕碼頭",
    };

    const res = validateAndNormalizeEvent(raw);
    expect(res.isValid).toBe(true);
    expect(res.event?.title).toBe("大稻埕散策走讀");
    expect(res.event?.city).toBe("臺北市");
    expect(res.event?.category).toBe("講座");
    expect(res.event?.source.name).toBe("本地匯入 (Local Import)");
  });

  it("deduplicates events by ID or title+date+city signature", () => {
    const ev1: any = {
      id: "ev-1",
      title: "衛武營音樂會",
      startsAt: "2026-09-20T19:30:00+08:00",
      category: "音樂",
      city: "高雄市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
    };

    // Duplicate by ID
    const ev2: any = {
      id: "ev-1",
      title: "衛武營音樂會 (不同標題)",
      startsAt: "2026-09-20T19:30:00+08:00",
      category: "音樂",
      city: "高雄市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
    };

    // Duplicate by signature (same title, date, city but different ID)
    const ev3: any = {
      id: "ev-other-id",
      title: "衛武營音樂會",
      startsAt: "2026-09-20T20:00:00+08:00",
      category: "音樂",
      city: "高雄市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
    };

    // Different event
    const ev4: any = {
      id: "ev-4",
      title: "國美館特展",
      startsAt: "2026-09-21T10:00:00+08:00",
      category: "展覽",
      city: "臺中市",
      source: { name: "demo", fetchedAt: "2026-09-12", isDemo: true },
    };

    const deduped = deduplicateEvents([ev1, ev2, ev3, ev4]);
    expect(deduped).toHaveLength(2);
    expect(deduped[0].id).toBe("ev-1");
    expect(deduped[1].id).toBe("ev-4");
  });

  it("parses and validates untrusted JSON payloads safely", () => {
    const rawJson = JSON.stringify([
      {
        title: "合格活動",
        startsAt: "2026-09-18T10:00:00+08:00",
        city: "臺南市",
        category: "節慶",
      },
      {
        // missing title
        startsAt: "2026-09-18T10:00:00+08:00",
        city: "臺南市",
      },
    ]);

    const result = parseAndValidateEventsJson(rawJson);
    expect(result.validEvents).toHaveLength(1);
    expect(result.rejectedCount).toBe(1);
    expect(result.errors[0].index).toBe(1);
  });
});
