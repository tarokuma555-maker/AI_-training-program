import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "個人情報の取り扱いについて定めたプライバシーポリシーです。",
};

// 雛形ページ：正式な文面に後で差し替える前提のダミーです
const sections = [
  {
    heading: "1. 取得する情報",
    body: "当プログラムは、申込フォームの送信時に、氏名・メールアドレス・電話番号（任意）およびフォームに入力いただいた回答内容を取得します。",
  },
  {
    heading: "2. 利用目的",
    body: "取得した情報は、受講可否の審査、無料相談およびプログラム運営に関するご連絡、ならびに関連する講座のご案内のために利用します。",
  },
  {
    heading: "3. 第三者提供",
    body: "法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供することはありません。",
  },
  {
    heading: "4. 業務委託先での取り扱い",
    body: "申込内容の保存・審査補助のため、データベースサービスおよびAIサービスの提供事業者に処理を委託することがあります。委託先には適切な安全管理を求めます。",
  },
  {
    heading: "5. 開示・訂正・削除のご請求",
    body: "ご本人からの開示・訂正・削除のご請求には、本人確認のうえ、合理的な範囲で速やかに対応します。",
  },
  {
    heading: "6. 改定",
    body: "本ポリシーの内容は、必要に応じて改定することがあります。改定後の内容は本ページに掲載した時点で効力を生じます。",
  },
  {
    heading: "7. お問い合わせ窓口",
    body: "個人情報の取り扱いに関するお問い合わせは、contact@example.com（差し替え予定）までご連絡ください。",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="text-3xl font-bold sm:text-4xl">プライバシーポリシー</h1>
        <p className="mt-4 text-sm text-navy/60">
          ※ 本ページは雛形です。正式な文面に差し替え予定です。
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy/80 sm:text-base">
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-12">
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
