const features = [
  {
    title: "経験を「翻訳」する",
    body: "現場での判断・管理の経験を、応募書類と面接で伝わる言葉に置き換えます。職務経歴の棚卸しから、プロが伴走します。",
  },
  {
    title: "Copilot実務研修つき",
    body: "Microsoft AB-730準拠のAI実務研修を受講。事務・IT職の現場で今すぐ使えるスキルを、手を動かしながら身につけます。",
  },
  {
    title: "3週目から応募開始",
    body: "修了を待ちません。第3週から実際の応募を開始し、選考を受けながら残りの研修で対策を重ねます。",
  },
];

export default function Features() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">プログラムの特徴</h2>
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 sm:p-7">
              <p className="text-sm font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy/80">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
