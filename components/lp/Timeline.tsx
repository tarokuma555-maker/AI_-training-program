const weeks = [
  {
    label: "第1-2週",
    title: "基礎",
    body: "経験の棚卸しとAI研修の基礎。現場での経験を職務経歴書に落とし込み、Copilotの実務活用を学びます。",
  },
  {
    label: "第3週",
    title: "応募開始",
    body: "修了を待たず、実際の求人への応募をスタート。書類を実戦で磨きます。",
  },
  {
    label: "第4-5週",
    title: "選考対策",
    body: "面接対策と応募の継続。選考のフィードバックを受けて伝え方を改善します。",
  },
  {
    label: "第6週",
    title: "伴走",
    body: "選考中の企業への対応を個別にサポート。内定後の条件確認まで伴走します。",
  },
];

export default function Timeline() {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          6週間の流れ
        </h2>
        <ol className="mt-12 space-y-0">
          {weeks.map((w, i) => (
            <li key={w.label} className="relative flex gap-6 pb-10 last:pb-0">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">
                  {i + 1}
                </div>
                {i < weeks.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-white/25" />
                )}
              </div>
              <div className="pt-1">
                <p className="text-sm font-medium text-accent">{w.label}</p>
                <h3 className="mt-1 text-lg font-bold">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {w.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
