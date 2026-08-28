import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "現場の経験を、次のキャリアの武器に。｜AI研修付き転職支援プログラム",
  description:
    "現場で判断・管理を担ってきた方を、同じ業界のホワイトカラー職へ。6週間のAI研修付き転職支援プログラム（費用は採用企業側負担）。",
  openGraph: {
    title: "現場の経験を、次のキャリアの武器に。",
    description:
      "AI研修付き転職支援プログラム（6週間・費用は採用企業側負担）",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
