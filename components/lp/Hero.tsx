export default function Hero() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="mb-4 inline-block rounded-full bg-teal/30 px-4 py-1.5 text-sm font-medium text-white/90">
          現場経験者のための転職支援プログラム
        </p>
        <h1 className="text-3xl font-bold leading-snug sm:text-5xl sm:leading-tight">
          現場の経験を、
          <br className="sm:hidden" />
          次のキャリアの武器に。
        </h1>
        <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">
          AI研修付き転職支援プログラム
          <br className="sm:hidden" />
          （6週間・費用は採用企業側負担）
        </p>
        <div className="mt-10">
          <a
            href="#apply"
            className="inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90"
          >
            申込フォームへ
          </a>
        </div>
      </div>
    </section>
  );
}
