import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "現場の経験を、次のキャリアの武器に。｜AI研修付き転職支援プログラム",
    template: "%s｜AI研修付き転職支援プログラム",
  },
  description:
    "現場経験者（飲食店長・施工管理・介護職など）を、同じ業界のホワイトカラー職への転職につなげる6週間プログラム。AI研修付き・費用は採用企業側負担。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "AI研修付き転職支援プログラム",
    title: "現場の経験を、次のキャリアの武器に。",
    description:
      "AI研修付き転職支援プログラム（6週間・費用は採用企業側負担）。現場での判断・管理の経験を、応募書類と面接で伝わる言葉に翻訳します。",
  },
  twitter: {
    card: "summary_large_image",
    title: "現場の経験を、次のキャリアの武器に。",
    description:
      "AI研修付き転職支援プログラム（6週間・費用は採用企業側負担）",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="bg-white font-sans text-navy antialiased">
        {children}
      </body>
    </html>
  );
}
