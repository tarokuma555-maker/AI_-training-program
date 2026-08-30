import Icon from "@/components/ui/Icon";

/** 中間CTA：申込ハードルを下げる不安解消ブロック */
export default function MidCta() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-teal/25 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-20">
        <h2 className="text-xl font-bold leading-relaxed sm:text-3xl">
          迷っているなら、
          <br className="sm:hidden" />
          まず無料相談（30分）から。
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist/80 sm:text-base">
          申込＝受講確定ではありません。フォームの内容をもとにお話しして、
          お互いに納得してから始める選考制です。無理な勧誘はしません。
        </p>
        <a
          href="#apply"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-10 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:translate-y-[-1px] hover:opacity-95"
        >
          申込フォームへ
          <Icon name="arrow" className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
