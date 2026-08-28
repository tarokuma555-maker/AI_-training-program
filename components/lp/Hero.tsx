export default function Hero() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        <p className="text-sm font-medium tracking-wide text-mist/80">
          AI研修付き転職支援プログラム
        </p>
        <h1 className="mt-10 text-3xl font-bold leading-snug sm:mt-14 sm:text-5xl sm:leading-tight">
          現場の経験を、
          <br className="sm:hidden" />
          次のキャリアの武器に。
        </h1>
        <p className="mt-6 text-base leading-relaxed text-mist/90 sm:text-lg">
          AI研修付き転職支援プログラム
          <span className="whitespace-nowrap">（6週間・費用は採用企業側負担）</span>
        </p>
        <div className="mt-10">
          <a
            href="#apply"
            className="inline-block rounded-full bg-accent px-10 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 sm:text-lg"
          >
            申込フォームへ
          </a>
        </div>
      </div>
    </header>
  );
}
