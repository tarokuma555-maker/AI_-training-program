const features = [
  {
    title: "経験を「翻訳」する",
    body: "現場での判断・管理の経験を、ホワイトカラー職の採用担当者に伝わる言葉へ翻訳。職務経歴書と面接の伝え方を根本から作り直します。",
  },
  {
    title: "Copilot実務研修つき",
    body: "Microsoft AB-730準拠のカリキュラムで、CopilotをはじめとするAIツールの実務活用を習得。入社後すぐに使えるスキルを身につけます。",
  },
  {
    title: "3週目から応募開始",
    body: "修了を待たずに、プログラム3週目から実際の応募を開始。学びながら選考を進めることで、6週間で内定までの距離を最短にします。",
  },
];

export default function Features() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          プログラムの特徴
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-navy/10 p-6"
            >
              <div className="mb-4 h-1.5 w-10 rounded-full bg-accent" />
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
