import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Kurenaido } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

// 黒板のチョーク文字用の手書き風フォント
const zenKurenaido = Zen_Kurenaido({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chalk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "受講生アプリ｜AI実務プログラム",
    template: "%s｜受講生アプリ",
  },
  description: "6週間プログラムの受講生向けアプリです。",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${zenKurenaido.variable}`}>
      <body className="bg-mist font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
