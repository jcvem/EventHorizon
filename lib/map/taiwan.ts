export interface TaiwanRegionInfo {
  id: string;
  name: string; // Canonical Traditional Chinese name (e.g. 臺北市)
  shortName: string; // Short 2-letter (e.g. 臺北)
  romaji: string;
  region: "北部" | "中部" | "南部" | "東部" | "離島";
  centerLat: number;
  centerLng: number;
  // SVG coordinates on 500x680 canvas projection
  svgX: number;
  svgY: number;
}

export const TAIWAN_CITIES: TaiwanRegionInfo[] = [
  // 北部
  { id: "KEE", name: "基隆市", shortName: "基隆", romaji: "Keelung", region: "北部", centerLat: 25.1276, centerLng: 121.7392, svgX: 355, svgY: 70 },
  { id: "TPE", name: "臺北市", shortName: "臺北", romaji: "Taipei", region: "北部", centerLat: 25.0375, centerLng: 121.5637, svgX: 325, svgY: 90 },
  { id: "NTP", name: "新北市", shortName: "新北", romaji: "New Taipei", region: "北部", centerLat: 24.9157, centerLng: 121.6739, svgX: 310, svgY: 120 },
  { id: "TYN", name: "桃園市", shortName: "桃園", romaji: "Taoyuan", region: "北部", centerLat: 24.9936, centerLng: 121.3010, svgX: 265, svgY: 110 },
  { id: "HSC", name: "新竹市", shortName: "竹市", romaji: "Hsinchu City", region: "北部", centerLat: 24.8039, centerLng: 120.9647, svgX: 235, svgY: 135 },
  { id: "HSH", name: "新竹縣", shortName: "竹縣", romaji: "Hsinchu County", region: "北部", centerLat: 24.8387, centerLng: 121.0177, svgX: 260, svgY: 155 },
  { id: "ILA", name: "宜蘭縣", shortName: "宜蘭", romaji: "Yilan", region: "北部", centerLat: 24.7021, centerLng: 121.7377, svgX: 350, svgY: 165 },

  // 中部
  { id: "MAL", name: "苗栗縣", shortName: "苗栗", romaji: "Miaoli", region: "中部", centerLat: 24.5602, centerLng: 120.8214, svgX: 215, svgY: 190 },
  { id: "TXG", name: "臺中市", shortName: "臺中", romaji: "Taichung", region: "中部", centerLat: 24.1477, centerLng: 120.6736, svgX: 200, svgY: 245 },
  { id: "CWH", name: "彰化縣", shortName: "彰化", romaji: "Changhua", region: "中部", centerLat: 24.0518, centerLng: 120.5161, svgX: 165, svgY: 275 },
  { id: "NTO", name: "南投縣", shortName: "南投", romaji: "Nantou", region: "中部", centerLat: 23.9609, centerLng: 120.9719, svgX: 245, svgY: 305 },
  { id: "YUN", name: "雲林縣", shortName: "雲林", romaji: "Yunlin", region: "中部", centerLat: 23.7092, centerLng: 120.4313, svgX: 150, svgY: 340 },

  // 南部
  { id: "CYI", name: "嘉義市", shortName: "嘉市", romaji: "Chiayi City", region: "南部", centerLat: 23.4800, centerLng: 120.4491, svgX: 165, svgY: 380 },
  { id: "CHI", name: "嘉義縣", shortName: "嘉縣", romaji: "Chiayi County", region: "南部", centerLat: 23.4518, centerLng: 120.2555, svgX: 140, svgY: 410 },
  { id: "TNN", name: "臺南市", shortName: "臺南", romaji: "Tainan", region: "南部", centerLat: 22.9997, centerLng: 120.2270, svgX: 145, svgY: 460 },
  { id: "KHH", name: "高雄市", shortName: "高雄", romaji: "Kaohsiung", region: "南部", centerLat: 22.6273, centerLng: 120.3014, svgX: 165, svgY: 520 },
  { id: "PIF", name: "屏東縣", shortName: "屏東", romaji: "Pingtung", region: "南部", centerLat: 22.5519, centerLng: 120.5487, svgX: 195, svgY: 575 },

  // 東部
  { id: "HUA", name: "花蓮縣", shortName: "花蓮", romaji: "Hualien", region: "東部", centerLat: 23.9871, centerLng: 121.6015, svgX: 335, svgY: 280 },
  { id: "TTT", name: "臺東縣", shortName: "臺東", romaji: "Taitung", region: "東部", centerLat: 22.7583, centerLng: 121.1444, svgX: 285, svgY: 475 },

  // 離島
  { id: "PEN", name: "澎湖縣", shortName: "澎湖", romaji: "Penghu", region: "離島", centerLat: 23.5711, centerLng: 119.5793, svgX: 55, svgY: 340 },
  { id: "KIN", name: "金門縣", shortName: "金門", romaji: "Kinmen", region: "離島", centerLat: 24.4493, centerLng: 118.3766, svgX: 50, svgY: 100 },
  { id: "LIE", name: "連江縣", shortName: "馬祖", romaji: "Matsu", region: "離島", centerLat: 26.1974, centerLng: 119.9575, svgX: 75, svgY: 50 },
];

export const REGIONS = ["全部", "北部", "中部", "南部", "東部", "離島"] as const;

export const MAP_METADATA = {
  version: "1.0.0",
  projection: "WGS84 Equirectangular / Simplified SVG",
  attribution: "地圖底圖以台灣地理特徵輪廓繪製，位置座標參考內政部國土測繪中心 (NLSC) 與 OpenStreetMap 開放資料。",
  lastUpdated: "2026-09",
};

/**
 * Normalizes user-input or scraped city strings into standard Taiwan administrative names.
 * e.g. "台北市" -> "臺北市", "台中" -> "臺中市", "高雄市新興區" -> "高雄市"
 */
export function canonicalizeCityName(raw: string | undefined | null): string {
  if (!raw) return "其他";
  const trimmed = raw.trim();

  // Normalize common variant character 台 -> 臺
  const normalized = trimmed.replace(/台/g, "臺");

  // Check direct matches
  for (const city of TAIWAN_CITIES) {
    if (normalized.includes(city.name) || normalized.includes(city.shortName)) {
      return city.name;
    }
  }

  // Handle special aliases
  if (normalized.includes("馬祖")) return "連江縣";
  if (normalized.includes("綠島") || normalized.includes("蘭嶼")) return "臺東縣";
  if (normalized.includes("小琉球")) return "屏東縣";

  return "其他";
}
