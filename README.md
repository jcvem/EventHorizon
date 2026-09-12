# EventsHorizon 臺灣藝文視野

> 臺灣在地藝文活動、音樂季、展覽特展、表演藝術與親子走讀地圖指南。
> 採用 Local-First（在地優先）架構，呈現未來滾動 30 天精彩盛事。

---

## 專案亮點與特色 (Key Highlights)

- **臺灣田野手冊美學 (Editorial Field-Guide Aesthetic)**：
  捨棄氾濫的紫色漸層與高飽和發光 dashboard。採用溫潤紙質底色 (`#F7F4EB`)、深潭青炭墨色 (`#1B2A28`)、臺灣紅磚赭色點睛 (`#C05C2B`) 與 1px 髮絲細線。無 Inter / Roboto / Arial，改用典雅宋體與人文黑體。
- **50 / 50 雙欄與跨面板聯動**：
  - **桌面端**：左側約 50% 臺灣向量地圖（含全臺 22 縣市活動錨點）；右側約 50% 上半部為未來 30 天行事曆，下半部為活動行程冊。
  - **行動端**：地圖優雅折疊於上方，行事曆與清單順暢垂直排列。
  - **全域聯動同步**：點選分類標籤、行事曆特定日期、地圖縣市錨點或活動卡片，三方面板即時連動過濾；提供一鍵重設。
- **時區與滾動 30 天視窗**：
  嚴格鎖定臺灣標準時間（`Asia/Taipei`, UTC+8）。自動計算本日 00:00:00 至第 30 日 23:59:59 之滾動視窗。
- **確定性展示種子 (Deterministic Demo Data)**：
  內建 26 筆涵蓋全臺北部、中部、南部、東部與離島等 22 縣市與 10 大分類之展示活動，所有展示資料均明確標註「展示資料 (Demo)」，不虛構現場 live 宣告。
- **公部門即時開放資料與安全 JSON 匯入**：
  架構具備類型化來源適配器（Source Adapter）。已實時 curl 驗證文化部全國藝文活動開放資料庫 (`cloud.culture.tw`)；並提供客戶端安全 JSON 格式檢核與匯入介面。
- **無障礙體驗**：
  地圖標記具備 44px 無障礙觸控熱區、鍵盤 `Enter` / `Space` 選取、高對比聚焦環與 `prefers-reduced-motion` 動態減弱支援。
- **輕量向量地圖**：
  原生純 SVG 幾何標繪，無須 Google Maps 或 Mapbox API 金鑰與地圖圖磚計費依賴。

---

## 快速開始與常用指令 (Commands)

### 1. 安裝相依套件
```bash
npm install
```

### 2. 語法與型態檢查 (Lint)
```bash
npm run lint
```

### 3. 單元與整合測試 (Tests)
```bash
# 支援 --runInBand 參數
npm test -- --runInBand
```

### 4. 產品建置 (Production Build)
```bash
npm run build
```

### 5. 啟動開發伺服器 (Development)
```bash
npm run dev
# 開啟瀏覽器造訪 http://localhost:3000
```

### 6. 活動資料檢核工具 (CLI Validation)
```bash
# 檢核內建展示資料庫
npm run validate:events

# 或檢核外部 JSON 檔案
npx tsx scripts/validate-events.ts path/to/events.json
```

---

## 目錄結構說明 (Architecture)

```text
EventsHorizon/
├── app/
│   ├── layout.tsx             # 繁體中文全站 layout 與中繼資料
│   ├── page.tsx               # 首頁 Server Component
│   ├── globals.css            # 田野手冊配色變數、髮絲細線與無障礙設定
│   └── api/
│       ├── events/route.ts    # 活動查詢與文化部即時介接 API
│       └── import/route.ts    # 安全 JSON 驗證與匯入 API
├── components/
│   ├── horizon-shell.tsx      # 核心協調器 (跨面板狀態管理)
│   ├── taiwan-map.tsx         # 臺灣向量互動地圖 (44px 觸控、密度標記)
│   ├── month-calendar.tsx     # 未來 30 天滾動行事曆 (單日選取、每日計數)
│   ├── category-filter.tsx    # 10 大主題領域分類膠囊 (親子、音樂、展覽...)
│   ├── event-list.tsx         # 活動清單卡片 (搜尋、履歷標註、官方連結)
│   ├── event-detail-modal.tsx # 活動完整詳情對話框
│   └── import-modal.tsx       # 資料來源管理與 JSON 驗證對話框
├── lib/
│   ├── events/
│   │   ├── types.ts           # Event, Category, Filter 完整 TypeScript 定義
│   │   ├── normalize.ts       # Asia/Taipei 時區標準化、縣市校正、去重與檢核
│   │   ├── filter.ts          # 滾動 30 天視窗判定、多維度篩選與計數彙總
│   │   ├── demo.ts            # 26 筆涵蓋全臺的確定性示範種子資料
│   │   ├── sources.ts         # Source Adapter (展示種子、文化部開放資料)
│   │   └── storage.ts         # 記憶體資料存放與快取管理
│   └── map/
│       └── taiwan.ts          # 全臺 22 縣市經緯度、SVG 投影座標與別名轉換
├── public/
│   └── taiwan.svg             # 簡約臺灣地理輪廓向量圖
├── tests/
│   ├── events-normalize.test.ts # 時區轉換、跨日、縣市校正、去重測試
│   ├── events-filter.test.ts    # 30天視窗、跨日重疊、各維度篩選測試
│   └── ui-smoke.test.tsx        # 地圖、行事曆、清單與互動煙霧測試
├── scripts/
│   └── validate-events.ts     # CLI 活動資料安全檢核工具
├── DESIGN.md                  # 設計系統手冊 (色彩、字型、抗 AI-Slop 原則)
└── README.md
```

---

## 資料來源與真實性聲明 (Data Sources & Provenance)

1. **展示資料 (Demo Seed)**：
   - 包含 26 筆測試活動，覆蓋全臺灣各行政區。
   - 所有卡片皆有 `isDemo: true` 且於畫面標記「展示資料 (Demo)」，以利離線開發與驗證。
2. **公部門即時開放資料 (Ministry of Culture Open Data)**：
   - 來源端點：`https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6`
   - 屬性：文化部藝文活動開放資料 API（已實際 curl 驗證其 JSON 欄位與連線能力）。
   - 當連線異常或無網路時，系統優雅維持本地資料，絕不捏造偽造假資料。
3. **地圖向量圖資授權與手繪風格地圖**：
   - 繪製手繪典雅風格臺灣地圖 (`public/taiwan_handdrawn.png`)，精準投影 22 行政縣市（基隆、臺北、新北、桃園、新竹、苗栗、臺中、彰化、南投、雲林、嘉義、臺南、高雄、屏東、宜蘭、花蓮、臺東、澎湖、金門、馬祖）。

---

## 真實活動資料收集與數據庫架構 (Event Ingestion & DB Architecture)

### 1. 如何收集真實活動？ (How to Collect Actual Events)
正式上線營運時，建議建立自動化爬蟲與清洗管線 (Crawler Pipeline)：
- **公部門開放資料 API**：介接中華民國文化部 API (`cloud.culture.tw`)。
- **售票平台與展演網站**：使用 GitHub Actions / Cloud Cron 定時爬取或對接 Accupass, KKTIX, iNDIEVOX, Opentix 之公開 RSS / API 展演頁面。
- **主辦單位自主投稿**：提供前端 JSON / 表單對話框匯入 (`import-modal.tsx`) 供策展單位提交。
- **Gemini AI 自動增強與分類**：定時 Worker 呼叫 Gemini API 進行內文摘要、自動判斷縣市與標準 10 大主題領域分類。

### 2. 是否需要 Firebase DB？ (Do You Need Firebase DB?)
- **不強制使用 Firebase**，但營運端**強烈建議搭配雲端 DB** (Firebase Firestore 或 Supabase PostgreSQL)。
- **推薦技術選型：Supabase (PostgreSQL)** 或 **Firebase Firestore**
  - **Supabase**：原生支援 PostGIS 地理空間查詢與豐富 SQL 日期過濾，極度適合 30 天滾動視窗。
  - **Firebase**：支援即時推送 (Realtime Update) 與免伺服器 (Serverless) 部署。

---

## 遠端版本庫狀態 (Remote Repository Note)

本機 Git 已初始化於 `main` 分支。
若需推播至 GitHub 私有遠端儲存庫 `EventsHorizon`，由於本機環境未安裝 GitHub CLI (`gh`) 且無配置授權憑證，遵循規範停止於 `NEED_GITHUB_AUTH`。使用者可於授權後執行：
```bash
git remote add origin git@github.com:<username>/EventsHorizon.git
git push -u origin main
```
