import Icon from "@/components/ui/Icon";

const badges = [
  "受講料は無料",
  "6週間・週1回2時間",
  "働きながら受講できる",
];

const stats = [
  { value: "6週間", label: "プログラム期間" },
  { value: "週2h", label: "講義＋課題2〜3h" },
  { value: "3週目", label: "から応募スタート" },
  { value: "無料", label: "受講費用" },
];

export default function Hero() {
  return (
    <>
      <header className="relative overflow-hidden bg-navy text-white">
        {/* 背景の淡い光（過度にならない範囲の装飾） */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-teal/25 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-20">
          <div className="animate-fade-up flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold text-white/90"
              >
                {b}
              </span>
            ))}
          </div>

          <h1 className="animate-fade-up-1 mt-8 text-[34px] font-bold leading-[1.35] sm:mt-10 sm:text-6xl sm:leading-[1.3]">
            現場の経験を、
            <br />
            次のキャリアの
            <span className="relative inline-block">
              武器
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-accent/70 sm:bottom-2 sm:h-4"
              />
            </span>
            に。
          </h1>

          <p className="animate-fade-up-1 mt-6 max-w-2xl text-base leading-relaxed text-mist/90 sm:text-lg">
            飲食店長・施工管理・介護職——現場で「判断」してきたあなたの経験を、
            AIスキルとかけ合わせて、同じ業界のホワイトカラー職への転職につなげる
            6週間のプログラムです。
          </p>

          <div className="animate-fade-up-2 mt-10">
            <a
              href="#apply"
              className="inline-flex items-center gap-3 rounded-full bg-accent px-10 py-4 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:translate-y-[-1px] hover:opacity-95 sm:px-12 sm:py-5 sm:text-lg"
            >
              申込フォームへ
              <Icon name="arrow" className="h-5 w-5" />
            </a>
            <p className="mt-3 text-xs text-mist/70">
              入力は約3分。選考制のため、申込＝受講確定ではありません。
            </p>
          </div>
        </div>
      </header>

      {/* 数字ストリップ（ヒーローに重ねる） */}
      <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-5 sm:-mt-14 sm:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-navy/10 shadow-lg sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-5 text-center">
              <dt className="order-2 mt-1 block text-xs text-navy/60">
                {s.label}
              </dt>
              <dd className="text-xl font-bold text-navy sm:text-2xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
