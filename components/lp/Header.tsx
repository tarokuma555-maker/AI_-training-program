export default function Header() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
        <p className="text-sm font-bold tracking-wide">
          AI研修付き転職支援プログラム
        </p>
        <a
          href="#apply"
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          申込フォームへ
        </a>
      </div>
    </div>
  );
}
