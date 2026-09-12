"use client";

import React, { useState } from "react";
import { TAIWAN_CITIES, TaiwanRegionInfo, MAP_METADATA } from "@/lib/map/taiwan";
import { Compass, RotateCcw, MapPin } from "lucide-react";

interface TaiwanMapProps {
  selectedCity: string | "all";
  onSelectCity: (city: string | "all") => void;
  cityEventCounts: Record<string, number>;
  totalEventsCount: number;
}

export const TaiwanMap: React.FC<TaiwanMapProps> = ({
  selectedCity,
  onSelectCity,
  cityEventCounts,
  totalEventsCount,
}) => {
  const [hoveredCity, setHoveredCity] = useState<TaiwanRegionInfo | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>("全部");

  const handleRegionFilter = (region: string) => {
    setActiveRegion(region);
    if (region === "全部") {
      onSelectCity("all");
    } else {
      // Find the first city in this region or keep city if it belongs to region
      const citiesInRegion = TAIWAN_CITIES.filter((c) => c.region === region);
      const currentInRegion = citiesInRegion.find((c) => c.name === selectedCity);
      if (!currentInRegion && citiesInRegion.length > 0) {
        onSelectCity(citiesInRegion[0].name);
      }
    }
  };

  const getMarkerRadius = (count: number) => {
    if (count === 0) return 6;
    if (count <= 2) return 10;
    if (count <= 5) return 14;
    return 18;
  };

  return (
    <div className="flex flex-col h-full bg-paper-card border border-rule rounded-sm shadow-editorial overflow-hidden">
      {/* Map Header / Controls */}
      <div className="p-4 border-b border-rule bg-paper-subtle/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-ochre" />
            <h2 className="font-serif text-lg font-bold text-ink-primary tracking-wide">
              臺灣藝文探索地圖
            </h2>
          </div>
          <p className="text-xs text-ink-muted font-sans mt-0.5">
            點選縣市標記同步篩選活動清單與行事曆
          </p>
        </div>

        {/* Region Quick Filters */}
        <div className="flex items-center gap-1 bg-paper border border-rule rounded p-0.5 text-xs">
          {["全部", "北部", "中部", "南部", "東部", "離島"].map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => handleRegionFilter(reg)}
              className={`px-2 py-1 rounded transition-colors ${
                activeRegion === reg && (reg === "全部" ? selectedCity === "all" : true)
                  ? "bg-ink-primary text-paper-card font-medium"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-paper-muted"
              }`}
            >
              {reg}
            </button>
          ))}
          {selectedCity !== "all" && (
            <button
              type="button"
              onClick={() => {
                setActiveRegion("全部");
                onSelectCity("all");
              }}
              title="清除縣市篩選"
              className="px-2 py-1 flex items-center gap-1 text-ochre hover:bg-ochre-light rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重設</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map SVG Viewport */}
      <div className="relative flex-1 min-h-[420px] lg:min-h-[540px] flex items-center justify-center p-3 sm:p-6 bg-paper select-none">
        {/* Subtle Map Coordinates / Watermark */}
        <div className="absolute top-4 left-4 text-[11px] font-mono text-ink-faint pointer-events-none">
          <div>LAT 21°53′N – 25°18′N</div>
          <div>LNG 119°18′E – 122°00′E</div>
          <div className="mt-1 text-ink-muted">全臺目前活動：{totalEventsCount} 場</div>
        </div>

        {/* Active Selection Indicator */}
        <div className="absolute top-4 right-4 bg-paper-card/90 backdrop-blur-sm border border-rule px-3 py-1.5 rounded text-xs text-ink-primary shadow-sm pointer-events-none">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-ochre" />
            <span>目前聚焦：</span>
            <span className="font-bold text-ochre">
              {selectedCity === "all" ? "全臺灣地區" : selectedCity}
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 500 700"
          className="w-full h-full max-h-[640px] drop-shadow-sm"
          style={{ maxHeight: "calc(100vh - 220px)" }}
          role="img"
          aria-label="臺灣活動分布地圖"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAE4D5" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background subtle grid */}
          <rect width="500" height="700" fill="url(#grid)" />

          {/* Surrounding Sea Outline Linework */}
          <path
            d="M 360,40 C 400,90 410,200 390,320 C 370,440 340,550 260,650"
            fill="none"
            stroke="#E0D9C8"
            strokeWidth="0.75"
            strokeDasharray="4 4"
          />
          <path
            d="M 120,80 C 100,200 110,360 130,500"
            fill="none"
            stroke="#E0D9C8"
            strokeWidth="0.75"
            strokeDasharray="4 4"
          />

          {/* Taiwan Islands Geometries */}
          <g className="taiwan-polygons" stroke="#BCB3A0" strokeWidth="1.2">
            {/* Main Island */}
            <path
              d="M 345,65 C 358,68 368,75 363,85 C 354,95 368,115 372,135 C 378,155 362,180 357,210 C 352,240 357,270 352,300 C 347,330 337,360 327,395 C 317,430 307,465 292,500 C 277,535 257,565 237,590 C 222,610 207,620 197,618 C 187,616 184,605 182,590 C 177,565 162,540 152,510 C 142,480 137,450 140,420 C 144,390 150,360 157,330 C 164,300 172,270 182,240 C 192,210 207,185 227,160 C 247,135 272,110 297,90 C 317,75 332,62 345,65 Z"
              fill="#F2ECE0"
              className="transition-colors duration-200"
            />
            {/* Central Mountain Range Ridge Line */}
            <path
              d="M 330,120 Q 295,240 268,360 T 235,540"
              fill="none"
              stroke="#D2C8B5"
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
            {/* Penghu */}
            <path
              d="M 50,335 C 45,330 55,320 60,325 C 65,330 65,345 60,350 C 55,355 45,350 50,335 Z M 65,355 C 62,352 68,348 70,352 C 72,356 68,360 65,355 Z"
              fill="#F2ECE0"
            />
            {/* Kinmen */}
            <path
              d="M 45,95 C 40,90 55,85 62,90 C 68,95 65,102 58,105 C 50,108 42,102 45,95 Z"
              fill="#F2ECE0"
            />
            {/* Matsu */}
            <path
              d="M 72,48 C 70,44 78,42 82,45 C 85,48 82,54 78,54 C 74,54 70,51 72,48 Z"
              fill="#F2ECE0"
            />
            {/* Green Island */}
            <path
              d="M 315,480 C 312,477 318,474 321,477 C 324,480 321,485 317,485 Z"
              fill="#F2ECE0"
            />
            {/* Orchid Island */}
            <path
              d="M 325,550 C 320,545 328,540 332,545 C 335,550 332,558 327,558 Z"
              fill="#F2ECE0"
            />
          </g>

          {/* City / County Markers */}
          {TAIWAN_CITIES.map((city) => {
            const count = cityEventCounts[city.name] || 0;
            const isSelected = selectedCity === city.name;
            const isHovered = hoveredCity?.id === city.id;
            const r = getMarkerRadius(count);

            return (
              <g
                key={city.id}
                role="button"
                tabIndex={0}
                aria-label={`${city.name}: ${count} 場活動`}
                onClick={() => {
                  onSelectCity(isSelected ? "all" : city.name);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCity(isSelected ? "all" : city.name);
                  }
                }}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                className="cursor-pointer group outline-none"
              >
                {/* 44px Accessible Touch/Click Target (Invisible Hit Area) */}
                <circle
                  cx={city.svgX}
                  cy={city.svgY}
                  r="22"
                  fill="transparent"
                  className="outline-none"
                />

                {/* Selection Halo / Ring */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={city.svgX}
                    cy={city.svgY}
                    r={r + 6}
                    fill="none"
                    stroke={isSelected ? "#C05C2B" : "#3D5250"}
                    strokeWidth="1.5"
                    strokeDasharray={isSelected ? undefined : "2 2"}
                    className="transition-all duration-200"
                  />
                )}

                {/* Main Marker Circle */}
                <circle
                  cx={city.svgX}
                  cy={city.svgY}
                  r={r}
                  fill={
                    isSelected
                      ? "#C05C2B"
                      : count > 0
                      ? "#1B2A28"
                      : "#A8B5B3"
                  }
                  stroke={isSelected ? "#FFFFFF" : "#FAF8F3"}
                  strokeWidth="1.5"
                  className="transition-transform duration-150 group-hover:scale-110"
                />

                {/* Marker Count or Center Dot */}
                {count > 0 ? (
                  <text
                    x={city.svgX}
                    y={city.svgY + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={count > 9 ? "10" : "11"}
                    fontWeight="bold"
                    fontFamily="'JetBrains Mono', monospace"
                    className="pointer-events-none select-none"
                  >
                    {count}
                  </text>
                ) : (
                  <circle
                    cx={city.svgX}
                    cy={city.svgY}
                    r="1.8"
                    fill="#FAF8F3"
                    className="pointer-events-none"
                  />
                )}

                {/* City Name Label */}
                <text
                  x={city.svgX}
                  y={city.svgY + r + 13}
                  textAnchor="middle"
                  fill={isSelected ? "#C05C2B" : isHovered ? "#1B2A28" : "#3D5250"}
                  fontWeight={isSelected || isHovered ? "bold" : "500"}
                  fontSize="11"
                  fontFamily="'Noto Serif TC', serif"
                  className="transition-colors pointer-events-none select-none"
                >
                  {city.shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip for Hovered City */}
        {hoveredCity && (
          <div
            className="absolute pointer-events-none bg-ink-primary text-paper-card px-2.5 py-1.5 rounded shadow-lg text-xs z-20 transition-all font-sans"
            style={{
              bottom: "16px",
              left: "16px",
            }}
          >
            <div className="font-bold font-serif text-sm text-ochre-light">
              {hoveredCity.name} ({hoveredCity.romaji})
            </div>
            <div className="text-[11px] text-paper-muted mt-0.5">
              活動數：{cityEventCounts[hoveredCity.name] || 0} 場
              {cityEventCounts[hoveredCity.name] ? "（點擊篩選）" : "（目前無活動）"}
            </div>
          </div>
        )}
      </div>

      {/* Map Footer / Legend & Attribution */}
      <div className="p-3 border-t border-rule bg-paper-subtle/50 text-[11px] text-ink-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-medium text-ink-secondary">密度圖例：</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ink-faint inline-block" />
            <span>0 場</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-ink-primary text-paper-card text-[9px] flex items-center justify-center font-bold">1</span>
            <span>1–2 場</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-ochre text-paper-card text-[9px] flex items-center justify-center font-bold">5</span>
            <span>3 場以上 / 選取</span>
          </div>
        </div>
        <div className="text-[10px] text-ink-faint">
          {MAP_METADATA.attribution}
        </div>
      </div>
    </div>
  );
};
