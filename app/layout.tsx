import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventsHorizon 臺灣藝文視野 | 未來30天在地活動與地圖指南",
  description:
    "臺灣在地藝文活動、音樂季、展覽特展、表演藝術與親子走讀活動地圖指南。本地優先架構，涵蓋全臺22縣市未來30天精彩活動。",
  keywords: ["臺灣活動", "藝文展覽", "音樂季", "親子走讀", "臺灣地圖", "週末活動"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body className="min-h-screen bg-paper text-ink-primary antialiased">
        {children}
      </body>
    </html>
  );
}
