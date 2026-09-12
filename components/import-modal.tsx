"use client";

import React, { useState } from "react";
import { Event } from "@/lib/events/types";
import { parseAndValidateEventsJson } from "@/lib/events/normalize";
import {
  X,
  UploadCloud,
  FileJson,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  RotateCcw,
} from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportEvents: (newEvents: Event[]) => void;
  onResetToDemo: () => void;
  onFetchLiveCultureData: () => Promise<{ success: boolean; count: number; message: string }>;
  onFetchFirestoreData?: () => Promise<{ success: boolean; count: number; message: string }>;
  onSyncToFirestore?: () => Promise<{ success: boolean; count: number; message: string }>;
  isFetchingLive: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportEvents,
  onResetToDemo,
  onFetchLiveCultureData,
  onFetchFirestoreData,
  onSyncToFirestore,
  isFetchingLive,
}) => {
  const [jsonText, setJsonText] = useState("");
  const [validationResult, setValidationResult] = useState<{
    validEvents: Event[];
    rejectedCount: number;
    errors: { index: number; reasons: string[] }[];
  } | null>(null);
  const [liveStatusMessage, setLiveStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidate = () => {
    if (!jsonText.trim()) {
      setValidationResult(null);
      return;
    }
    const res = parseAndValidateEventsJson(jsonText);
    setValidationResult(res);
  };

  const handleApplyImport = () => {
    if (validationResult && validationResult.validEvents.length > 0) {
      onImportEvents(validationResult.validEvents);
      setJsonText("");
      setValidationResult(null);
      onClose();
    }
  };

  const handleTriggerLiveFetch = async () => {
    setLiveStatusMessage("正在連線文化部開放資料庫 (cloud.culture.tw)...");
    const res = await onFetchLiveCultureData();
    setLiveStatusMessage(res.message);
  };

  const handleTriggerFirestoreFetch = async () => {
    if (!onFetchFirestoreData) return;
    setLiveStatusMessage("正在讀取 Firebase (joecalendar-e8327) Firestore...");
    const res = await onFetchFirestoreData();
    setLiveStatusMessage(res.message);
  };

  const handleTriggerFirestoreSync = async () => {
    if (!onSyncToFirestore) return;
    setLiveStatusMessage("正在寫入/同步至 Firebase (joecalendar-e8327) Firestore...");
    const res = await onSyncToFirestore();
    setLiveStatusMessage(res.message);
  };

  const sampleJson = `[
  {
    "title": "2026 臺北大稻埕秋日老街琴音饗宴",
    "startsAt": "2026-09-25T15:00:00+08:00",
    "category": "音樂",
    "city": "臺北市",
    "venue": "屈臣氏大藥房 二樓藝文空間",
    "priceText": "免費自由入場",
    "url": "https://travel.taipei",
    "description": "走入大稻埕歷史街廓，聆聽臺灣民謠古典二重奏演繹。"
  }
]`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-[2px] animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-paper-card border border-rule rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-rule bg-paper-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-ochre" />
            <div>
              <h3 className="font-serif text-lg font-bold text-ink-primary">
                資料來源管理與 JSON 匯入
              </h3>
              <p className="text-xs text-ink-muted">
                支援本地安全 JSON 格式驗證、文化部即時開放資料讀取或展示種子還原
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="p-1 rounded text-ink-muted hover:text-ink-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-ink-primary">
          {/* Section 1: Firebase Firestore (joecalendar-e8327) Integration */}
          <div className="p-3.5 rounded border border-ochre-border bg-ochre-light/30 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-serif text-sm font-bold text-ink-primary flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-ochre" />
                  <span>Firebase 專屬雲端資料庫 (joecalendar-e8327)</span>
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  專案 ID：<code className="font-mono text-ochre font-bold">joecalendar-e8327</code> · 集合 (Collection)：<code className="font-mono text-ink-primary">events</code>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isFetchingLive}
                  onClick={handleTriggerFirestoreFetch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink-primary text-paper-card hover:bg-ink-secondary disabled:opacity-50 transition-colors font-medium min-h-[36px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? "animate-spin text-ochre" : ""}`} />
                  <span>載入 Firestore 資料</span>
                </button>
                <button
                  type="button"
                  disabled={isFetchingLive}
                  onClick={handleTriggerFirestoreSync}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ochre text-white hover:bg-ochre-hover disabled:opacity-50 transition-colors font-medium min-h-[36px]"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>同步至 Firestore</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Live Public Open Data Fetch */}
          <div className="p-3.5 rounded border border-rule bg-paper space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-serif text-sm font-bold text-ink-primary">
                  公部門即時開放資料：文化部全國藝文展覽
                </h4>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  已於架構層 curl 驗證其規格。資料源：文化部藝文活動開放資料 API。
                </p>
              </div>
              <button
                type="button"
                disabled={isFetchingLive}
                onClick={handleTriggerLiveFetch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-paper-subtle border border-rule hover:bg-paper-muted text-ink-primary disabled:opacity-50 transition-colors font-medium min-h-[36px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? "animate-spin text-ochre" : ""}`} />
                <span>載入即時開放資料</span>
              </button>
            </div>

            {liveStatusMessage && (
              <div className="p-2 rounded bg-paper-subtle border border-rule text-ink-secondary font-mono text-[11px]">
                {liveStatusMessage}
              </div>
            )}
          </div>

          {/* Section 2: Local JSON Schema Import */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-serif font-bold text-sm text-ink-primary flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-ochre" />
                <span>匯入自訂活動 JSON</span>
              </label>
              <button
                type="button"
                onClick={() => setJsonText(sampleJson)}
                className="text-ochre hover:underline text-[11px]"
              >
                載入範例格式
              </button>
            </div>

            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setValidationResult(null);
              }}
              placeholder={`貼上活動 JSON 陣列或物件，例如：\n${sampleJson}`}
              className="w-full p-2.5 bg-paper border border-rule rounded font-mono text-xs text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-ink-secondary"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleValidate}
                disabled={!jsonText.trim()}
                className="px-3 py-1.5 rounded bg-paper-subtle border border-rule hover:border-rule-dark text-ink-primary disabled:opacity-40 font-medium"
              >
                驗證資料格式
              </button>

              {validationResult && (
                <button
                  type="button"
                  disabled={validationResult.validEvents.length === 0}
                  onClick={handleApplyImport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-ochre hover:bg-ochre-hover text-white disabled:opacity-40 font-semibold"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>確定匯入 ({validationResult.validEvents.length} 筆通過)</span>
                </button>
              )}
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div className="p-3 rounded border border-rule bg-paper space-y-2">
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1 text-ink-primary">
                    <CheckCircle className="w-3.5 h-3.5 text-ochre" />
                    通過驗證：{validationResult.validEvents.length} 筆
                  </span>
                  {validationResult.rejectedCount > 0 && (
                    <span className="flex items-center gap-1 text-red-700">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      格式未通過：{validationResult.rejectedCount} 筆
                    </span>
                  )}
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-[11px] text-red-800 bg-red-50/60 p-2 rounded">
                    {validationResult.errors.map((err, i) => (
                      <div key={i}>
                        項目 #{err.index + 1}: {err.reasons.join(", ")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Reset to demo */}
          <div className="pt-2 border-t border-rule flex items-center justify-between">
            <span className="text-ink-muted text-[11px]">
              若需重設所有活動資料至初始展示種子：
            </span>
            <button
              type="button"
              onClick={() => {
                onResetToDemo();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-paper-subtle border border-rule hover:bg-paper-muted text-ink-secondary"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ochre" />
              <span>還原展示種子資料</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-rule bg-paper-subtle flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs bg-paper border border-rule hover:bg-paper-muted text-ink-primary"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
