const faqs = [
  {
    q: "本当に費用がかからないのですか？",
    a: "受講生の方に受講料のご負担はありません。本プログラムの費用は、採用が決まった企業側が負担する仕組みです。人材を求める企業が「現場経験とAIスキルを持つ人材の紹介」に対して費用を支払うため、受講生の方から金銭をいただくことは一切ありません。",
  },
  {
    q: "未経験でも大丈夫ですか？",
    a: "ホワイトカラー職としての実務経験は不要です。本プログラムは「現場での判断・管理の経験」を土台に、それを応募先に伝わる形へ翻訳することを目的としています。現場での経験そのものが応募の武器になります。",
  },
  {
    q: "働きながら受講できますか？",
    a: "できます。講義は週1回2時間で、録画補講にも対応しています。加えて週2〜3時間の課題時間を確保できれば、在職中の方でも無理なく受講できる設計です。",
  },
  {
    q: "選考では何を見るのですか？",
    a: "応募フォームの内容から、①目指す職種・業界が具体的か、②現場で「作業」ではなく「判断」を伴う経験をお持ちか、③希望時期と確保できる時間のバランスが現実的か、を拝見します。AIによる一次判定の後、最終的には運営者が無料相談（30分）でお話しした上で判断します。",
  },
  {
    q: "AIを使ったことがなくても大丈夫ですか？",
    a: "問題ありません。プログラムの第1-2週でCopilotをはじめとするAIツールの基礎から実務活用までを扱います（Microsoft AB-730準拠）。パソコンの基本操作ができれば、AIの経験は不要です。",
  },
];

export default function Faq() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          よくある質問
        </h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-navy/10 bg-white open:bg-base/60"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-bold [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span
                  aria-hidden
                  className="shrink-0 text-xl text-teal transition-transform group-open:rotate-45"
                >
                  ＋
                </span>
              </summary>
              <p className="px-6 pb-6 text-sm leading-relaxed text-navy/75">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
