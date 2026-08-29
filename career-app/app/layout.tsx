import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
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
    <html lang="ja" className={notoSansJP.variable}>
      <body className="bg-mist font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
