const steps = [
  {
    week: "第1-2週",
    title: "基礎",
    body: "経験の棚卸しとAI実務の基礎。現場での判断・管理の経験を言語化し、Copilotの操作を習得します。",
  },
  {
    week: "第3週",
    title: "応募開始",
    body: "職務経歴書を仕上げ、実際の応募を開始。修了を待たずに選考に進みます。",
  },
  {
    week: "第4-5週",
    title: "選考対策",
    body: "書類のブラッシュアップと面接対策。応募の状況を見ながら個別に調整します。",
  },
  {
    week: "第6週",
    title: "伴走",
    body: "選考中の企業への対応を個別にサポート。内定後の条件確認まで伴走します。",
  },
];

export default function Timeline() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">6週間の流れ</h2>
        <ol className="mt-8 space-y-0 sm:mt-10">
          {steps.map((step, i) => (
            <li key={step.week} className="relative flex gap-5 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span className="w-px flex-1 bg-teal/30" aria-hidden />
                )}
              </div>
              <div className="pb-2">
                <p className="text-sm font-bold text-teal">{step.week}</p>
                <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/80">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
