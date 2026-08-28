"use client";

import { useState } from "react";

// 案内メールの定型文（プレースホルダ。正式な文面には後で差し替える）
// メール送信機能は実装しない。コピーして手元のメーラーから送る運用。

const approvedTemplate = {
  label: "承認（無料相談のご案内）",
  subject: "【一次選考通過】無料相談（30分）のご案内",
  body: `{氏名}様

このたびはAI研修付き転職支援プログラムにお申込みいただき、
ありがとうございます。

一次選考を通過されましたので、次のステップとして
無料相談（30分）のご案内をいたします。

▼日程調整はこちら
（日程調整用URLをここに記載）

ご不明な点がありましたら、このメールにご返信ください。

（※プレースホルダです。正式な文面に差し替えてください）`,
};

// 見送り文面の構成順序（差し替え時も必ずこの順を守ること）：
// ①講座見送りの通知 → ②転職支援自体の案内 → ③次期の優先案内 → ④末尾に有料講座
const waitlistTemplate = {
  label: "見送り（次期のご案内）",
  subject: "選考結果と今後のご案内",
  body: `{氏名}様

このたびはAI研修付き転職支援プログラムにお申込みいただき、
ありがとうございます。

（①講座見送り）
慎重に選考いたしました結果、誠に恐れ入りますが、
今期のご受講は見送りとさせていただくこととなりました。

（②転職支援の案内）
なお、プログラムの受講とは別に、転職に関するご相談は
随時承っています。ご希望の際はこのメールにご返信ください。

（③次期優先案内）
次期の募集を開始する際には、今回お申込みいただいた方へ
優先的にご案内いたします。

（④末尾に有料講座）
また、AIスキルを学べる有料講座もご用意しています。
詳細はこちら：（/skill ページのURLをここに記載）

（※プレースホルダです。正式な文面に差し替えてください）`,
};

// スキル講座の案内（スキルトラック関連のため「転職」「求人」「紹介」の語を使わない）
const skillRouteTemplate = {
  label: "スキル講座のご案内",
  subject: "AI実務スキル講座のご案内",
  body: `{氏名}様

このたびはお申込みいただき、ありがとうございます。

ご希望内容を拝見し、AI実務スキル講座（有料）のご案内を
お送りいたします。Copilotをはじめとする生成AIツールの
実務活用を、基礎から体系的に学べる講座です。

現在開講の準備を進めており、詳細が決まり次第
あらためてご連絡いたします。

詳細はこちら：（/skill ページのURLをここに記載）

（※プレースホルダです。正式な文面に差し替えてください）`,
};

const templates = [approvedTemplate, waitlistTemplate, skillRouteTemplate];

export default function MailTemplates() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (label: string, subject: string, body: string) => {
    try {
      await navigator.clipboard.writeText(`件名：${subject}\n\n${body}`);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-navy/60">
        メール送信機能はありません。ステータスに応じた定型文をコピーし、
        手元のメーラーから送信してください（文面はプレースホルダです）。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {templates.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleCopy(t.label, t.subject, t.body)}
            className="flex-1 rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm font-medium transition hover:border-teal hover:text-teal"
          >
            {copied === t.label ? "コピーしました ✓" : `${t.label}をコピー`}
          </button>
        ))}
      </div>
    </div>
  );
}
