import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "個人情報の取り扱いについて定めるプライバシーポリシーです。",
};

const sections = [
  {
    title: "1. 事業者情報",
    body: "（運営者名・所在地・連絡先をここに記載します。正式な文面に差し替え予定のダミーです。）",
  },
  {
    title: "2. 取得する個人情報",
    body: "申込フォームを通じて、氏名、メールアドレス、電話番号（任意）、およびご回答いただいた内容を取得します。",
  },
  {
    title: "3. 利用目的",
    body: "取得した個人情報は、受講選考のご連絡、プログラムの運営、および重要なお知らせの送付のために利用します。目的の範囲を超えて利用することはありません。",
  },
  {
    title: "4. 第三者提供",
    body: "法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供することはありません。",
  },
  {
    title: "5. 安全管理",
    body: "個人情報への不正アクセス、紛失、漏えい等を防止するため、適切な安全管理措置を講じます。",
  },
  {
    title: "6. 開示・訂正・削除",
    body: "ご本人からの個人情報の開示・訂正・削除のご請求には、本人確認の上、速やかに対応します。",
  },
  {
    title: "7. お問い合わせ窓口",
    body: "（お問い合わせ先のメールアドレス等をここに記載します。）",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
        <p className="mt-4 text-sm text-navy/60">
          ※ 本ページは雛形です。公開前に正式な文面へ差し替えてください。
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy/75">
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-teal underline hover:opacity-80"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
