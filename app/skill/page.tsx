import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI実務スキル講座（準備中）",
  description:
    "Copilotを中心としたAI実務スキルを学ぶ有料講座です。現在準備中です。",
};

// 表記ルール：このページには「転職」「求人」「紹介」の語を入れない
export default function SkillPage() {
  return (
    <main className="flex min-h-screen flex-col bg-mist">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-medium text-teal">SKILL COURSE</p>
        <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">
          AI実務スキル講座
          <span className="mt-2 block text-lg font-medium text-navy/60 sm:text-xl">
            （準備中）
          </span>
        </h1>
        <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8">
          <p className="text-base leading-relaxed text-navy/80">
            Copilotを中心としたAI実務スキルを、手を動かしながら学ぶ有料講座です。
            Microsoft AB-730準拠のカリキュラムをもとに、日々の業務にすぐ活かせる
            使い方を身につけます。
          </p>
          <p className="mt-4 text-base leading-relaxed text-navy/80">
            現在、開講に向けて準備中です。詳細が決まり次第、このページでご案内します。
          </p>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-teal underline underline-offset-4"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
