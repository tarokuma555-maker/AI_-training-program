import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "AI実務スキル講座（準備中）" },
  description:
    "Copilotをはじめとする生成AIの実務活用を学ぶ有料講座です。現在準備中です。",
};

export default function SkillPage() {
  return (
    <main className="flex min-h-screen flex-col bg-base">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20">
        <p className="text-sm font-medium text-teal">有料講座</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          AI実務スキル講座（準備中）
        </h1>
        <p className="mt-6 leading-relaxed text-navy/75">
          Copilotをはじめとする生成AIツールの実務活用を、基礎から体系的に学ぶ有料講座です。
          Microsoft AB-730に準拠したカリキュラムで、日々の業務にすぐ活かせるスキルを身につけます。
        </p>
        <p className="mt-4 leading-relaxed text-navy/75">
          現在、開講に向けて準備を進めています。詳細が決まり次第、このページでご案内します。
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block rounded-xl border border-navy/20 px-6 py-3 text-sm font-medium text-navy transition hover:bg-white"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
