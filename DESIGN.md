# EventsHorizon 設計規範手冊 (Design System Specification)

## 1. 設計哲學：臺灣風土紀事與踏查田野手冊 (Editorial Taiwan Field-Guide Aesthetic)

EventsHorizon 摒棄時下千篇一律的「AI 科技感深色儀表板」、「紫色/靛藍/紫羅蘭漸層」、「玻璃擬態 (Glassmorphism)」與「高飽和霓虹發光」等過度渲染的視覺風格。

本系統採用**臺灣田野風土手冊（Field-Guide Archive）**之編排哲學：
- **紙本溫潤底蘊**：以略帶纖維感與柔和溫度的米白風土紙（Warm Paper）為底色，營造自然、耐讀、長久駐足的閱讀體驗。
- **墨色拓印質地**：文字與核心線條取自臺灣山林深潭之墨綠青炭色（Ink Teal-Charcoal），兼具古籍書道張力與現代排版俐落感。
- **風土磚褐點睛**：全系統僅使用單一紅土/紅磚赭色（Taiwan Terracotta Ochre）作為視覺焦點，象徵島嶼紅磚街廓、老廟瓦當與工藝陶土之熱忱。
- **地貌測繪細線**：以 1px 髮絲細線（Hairline Rules）及地形測繪等高斷線分割版面，呈現地質地圖典藏感。

---

## 2. 色彩系統 (Color Palette)

嚴格禁止使用任何紫色（Purple）、靛藍（Indigo）、紫羅蘭（Violet）或螢光漸層。

### 2.1 基礎紙質色彩 (Paper Surfaces)
| 變數名稱 | 色碼 | 用途說明 |
| :--- | :--- | :--- |
| `paper` | `#F7F4EB` | 主畫布底色，溫暖非死白的紙質調性 |
| `paper-subtle` | `#F1ECE1` | 次級區塊底色、工具列、行事曆表頭 |
| `paper-card` | `#FCFAF5` | 卡片表面、對話視窗主體，提供輕微層次對比 |
| `paper-muted` | `#EAE4D5` | 標籤背景、未選取膠囊、分割條 |

### 2.2 墨色墨水色彩 (Ink Typography & Linework)
| 變數名稱 | 色碼 | 用途說明 |
| :--- | :--- | :--- |
| `ink-primary` | `#1B2A28` | 深墨綠青炭色，主要標題、核心幾何、活動數量標記 |
| `ink-secondary` | `#3D5250` | 次級墨色，正文內容、場館地點、篩選標籤 |
| `ink-muted` | `#697F7D` | 說明文字、時區備註、輔助資訊 |
| `ink-faint` | `#9FB0AE` | 經緯度刻度、非作用中日期數字、背景參考網格 |

### 2.3 點睛赭色 (Single Ochre Accent)
| 變數名稱 | 色碼 | 用途說明 |
| :--- | :--- | :--- |
| `ochre` | `#C05C2B` | 核心活動選取、地圖焦點標記、主要行動按鈕 |
| `ochre-hover` | `#A84E22` | 赭色懸浮狀態 |
| `ochre-light` | `#F7ECE6` | 赭色選取反白膠囊底色 |
| `ochre-border`| `#E5AB90` | 赭色焦點邊框 |

### 2.4 測繪格線 (Cartographic Hairlines)
| 變數名稱 | 色碼 | 用途說明 |
| :--- | :--- | :--- |
| `rule` | `#DDD6C6` | 標準 1px 髮絲分隔線 |
| `rule-dark` | `#BCB3A0` | 地圖輪廓線、強化邊框 |
| `rule-subtle`| `#EBE5D8` | 隱微網格與淡化分隔 |

---

## 3. 字型排印規範 (Typography)

嚴格禁止引入或載入 `Inter`、`Roboto`、`Arial`。

- **標題字族 (Heading Serif)**：`"Noto Serif TC"`, `"Songti TC"`, `"Source Han Serif TW"`, `Baskerville`, `Georgia`, `serif`
  - 用於：App 品牌標誌、各區塊主標題、活動大標、地圖地名標籤。
  - 特徵：具有典雅宋體襯線，傳達文史與風土手冊質感。
- **內文字族 (Body Grotesk/Humanist Sans)**：`"Noto Sans TC"`, `"PingFang TC"`, `"Lantinghei TC"`, `"Microsoft JhengHei"`, `sans-serif`
  - 用於：活動摘要、分類標籤、篩選按鈕、無障礙說明。
- **數據與時間字族 (Mono Numerals)**：`"JetBrains Mono"`, `"SF Mono"`, `Menlo`, `monospace`
  - 用於：ISO 日期、24小時制時間、經緯度刻度、活動計數。

---

## 4. 佈局架構與幾何分割 (Layout & Spatial Geometry)

### 4.1 桌面端 (Desktop ≥ 1024px)
- **左右 50 / 50 對分**：
  - **左側 (~50%)**：臺灣地理地圖（Taiwan Cartographic Vector Map）。以臺灣經緯度比例繪製向量輪廓，呈現全臺 22 縣市活動密度錨點與區域快速切換。
  - **右側 (~50%)**：
    - 上半部：未來 30 天滾動行事曆（Rolling 30-Day Month Calendar），標記每日活動密度與今天/選取狀態。
    - 下半部：活動行程冊（Scrollable Event List），以緊湊、清晰的卡片列出篩選後的所有活動，提供全文搜尋與詳細資訊檢視。

### 4.2 行動端 (Mobile < 1024px)
- 響應式垂直堆疊：地圖折疊於上方（高度限制，支援觸控滑動），行事曆與活動清單循序排列於下方，保持操作單手友善。

---

## 5. 無障礙與人機互動 (Accessibility & Ergonomics)

1. **觸控熱區 (Touch Targets)**：所有地圖城市標記、分類按鈕、行事曆日期格均保證至少 `44px × 44px` 可點擊區域。
2. **鍵盤可操作性 (Keyboard Navigation)**：
   - 地圖各縣市錨點標記具備 `role="button"`、`tabIndex={0}` 與 `aria-label`。
   - 支援 `Enter` 與 `Space` 鍵切換選取。
3. **無障礙聚焦 (Focus Visible)**：所有可互動元素在獲得焦點時具備 `2px solid #C05C2B` 高對比赭色聚焦環，具備 2px 偏移。
4. **減弱動態偏好 (prefers-reduced-motion)**：全站動畫在使用者開啟減弱動態時自動將過渡時間縮減至 0.01ms。
5. **資料透明度 (Provenance Transparency)**：每一筆展示活動卡片均明確標記「展示資料 (Demo)」，不偽造或宣稱其為未經證實的即時現場資訊。
