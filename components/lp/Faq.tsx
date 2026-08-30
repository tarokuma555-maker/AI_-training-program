const faqs = [
  {
    q: "本当に費用がかからないのですか？",
    a: "はい。本プログラム（転職支援プログラム）は無料で受講でき、受講生の方に費用の請求が発生することはありません。なお、AI実務スキルの習得のみを目的とした有料講座は別にご用意しています。",
  },
  {
    q: "未経験でも大丈夫ですか？",
    a: "事務職・IT職としての実務が未経験であることを前提に設計しています。現場で「判断・管理」を担ってきた経験こそが評価対象です。その経験を応募先に伝わる言葉に翻訳するのがこのプログラムの役割です。",
  },
  {
    q: "働きながら受講できますか？",
    a: "できます。週1回2時間の講義と、週2〜3時間の課題時間を確保できれば、在職中でも受講可能です。多くの方が働きながらの受講を想定しています。",
  },
  {
    q: "選考では何を見ますか？",
    a: "「どんな仕事に就きたいかが具体的か」「現場で判断・管理を担った経験があるか」「学習時間を現実的に確保できるか」を中心に、申込フォームの内容と無料相談（30分）でお話しした内容から総合的に判断します。",
  },
  {
    q: "AIを使ったことがなくても大丈夫ですか？",
    a: "大丈夫です。第1-2週でAIの基礎から学び、Microsoft AB-730準拠のCopilot実務研修で段階的に習得します。事前の知識は前提にしていません。",
  },
];

export default function Faq() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold tracking-[0.2em] text-teal">FAQ</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">よくある質問</h2>
        <div className="mt-8 space-y-3 sm:mt-10">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-mist bg-white open:bg-mist/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-base font-bold sm:p-6 [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span
                  className="shrink-0 text-accent transition group-open:rotate-45"
                  aria-hidden
                >
                  ＋
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-navy/80 sm:px-6 sm:pb-6 sm:text-base">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
