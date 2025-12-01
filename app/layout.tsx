import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticlog - シンプルな作業時間記録アプリ",
  description: "フリーランサー・リモートワーカーのためのシンプルで使いやすい時間管理ツール。クライアント別・タスク別の作業時間を簡単に記録・分析。",
  keywords: ["時間管理", "タイムトラッキング", "作業時間記録", "フリーランス", "リモートワーク", "生産性"],
  authors: [{ name: "Ticlog" }],
  openGraph: {
    title: "Ticlog - シンプルな作業時間記録アプリ",
    description: "フリーランサー・リモートワーカーのためのシンプルで使いやすい時間管理ツール。",
    type: "website",
    locale: "ja_JP",
    siteName: "Ticlog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ticlog - シンプルな作業時間記録アプリ",
    description: "フリーランサー・リモートワーカーのためのシンプルで使いやすい時間管理ツール。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
