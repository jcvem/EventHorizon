import fs from "fs";
import path from "path";
import { getDemoEvents } from "../lib/events/demo";
import { parseAndValidateEventsJson, validateAndNormalizeEvent } from "../lib/events/normalize";
import { getRolling30DayWindow, filterEvents } from "../lib/events/filter";
import { EVENT_CATEGORIES } from "../lib/events/types";
import { TAIWAN_CITIES } from "../lib/map/taiwan";

async function main() {
  console.log("=== EventsHorizon 活動資料驗證工具 ===");
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] !== "--demo") {
    const targetPath = path.resolve(process.cwd(), args[0]);
    console.log(`正在讀取目標檔案: ${targetPath}`);

    if (!fs.existsSync(targetPath)) {
      console.error(`錯誤: 檔案不存在: ${targetPath}`);
      process.exit(1);
    }

    const rawContent = fs.readFileSync(targetPath, "utf-8");
    const result = parseAndValidateEventsJson(rawContent);

    console.log(`\n驗證結果:`);
    console.log(`- 成功通過驗證: ${result.validEvents.length} 筆`);
    console.log(`- 格式未通過: ${result.rejectedCount} 筆`);

    if (result.errors.length > 0) {
      console.log(`\n未通過詳情:`);
      result.errors.forEach((err) => {
        console.log(`  [項目 #${err.index + 1}] ${err.reasons.join("; ")}`);
      });
      process.exit(1);
    } else {
      console.log("\n驗證全部通過！");
      process.exit(0);
    }
  }

  // Otherwise validate default demo events dataset
  console.log("正在驗證內建展示活動種子資料庫 (Demo Events)...");
  const demoEvents = getDemoEvents();
  console.log(`總展示資料筆數: ${demoEvents.length} 筆`);

  if (demoEvents.length < 20) {
    console.error(`錯誤: 展示活動少於 20 筆 (目前: ${demoEvents.length})`);
    process.exit(1);
  }

  let errorsFound = 0;
  demoEvents.forEach((ev, idx) => {
    const res = validateAndNormalizeEvent(ev);
    if (!res.isValid) {
      console.error(`  [錯誤 #${idx + 1}] ${ev.title}: ${res.errors.join(", ")}`);
      errorsFound++;
    }
  });

  if (errorsFound > 0) {
    console.error(`發現 ${errorsFound} 筆格式錯誤！`);
    process.exit(1);
  }

  // Verify rolling 30-day window filtering
  const window = getRolling30DayWindow();
  const activeEvents = filterEvents(demoEvents, { category: "all", city: "all" }, window);
  console.log(`未來 30 天視窗 (${window.startDateStr} ~ ${window.endDateStr}) 內有效活動: ${activeEvents.length} 筆`);

  if (activeEvents.length < 20) {
    console.error(`錯誤: 視窗內有效活動少於 20 筆 (目前: ${activeEvents.length})`);
    process.exit(1);
  }

  // Verify categories coverage
  const categoriesPresent = new Set(activeEvents.map((e) => e.category));
  console.log(`涵蓋分類數量: ${categoriesPresent.size} / ${EVENT_CATEGORIES.length}`);

  // Verify regions coverage
  const citiesPresent = new Set(activeEvents.map((e) => e.city));
  console.log(`涵蓋臺灣縣市數量: ${citiesPresent.size} / ${TAIWAN_CITIES.length}`);

  // Verify provenance labeling
  const demoLabeled = demoEvents.every((e) => e.source.isDemo === true);
  if (!demoLabeled) {
    console.error("錯誤: 有展示資料未正確標記 isDemo: true");
    process.exit(1);
  }

  console.log("\n所有展示資料檢核成功，符合規格！");
  process.exit(0);
}

main().catch((err) => {
  console.error("執行異常:", err);
  process.exit(1);
});
