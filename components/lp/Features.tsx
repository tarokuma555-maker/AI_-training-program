import Icon, { type IconName } from "@/components/ui/Icon";

const features: {
  icon: IconName;
  title: string;
  body: string;
}[] = [
  {
    icon: "pencil",
    title: "経験を「翻訳」する",
    body: "シフト調整、発注、クレーム対応——現場での判断・管理の経験を、応募書類と面接で伝わる言葉に置き換えます。職務経歴の棚卸しから、プロが一緒にやります。",
  },
  {
    icon: "sparkle",
    title: "Copilot実務研修つき",
    body: "Microsoft AB-730準拠のAI実務研修。事務・IT職の現場で今すぐ使えるスキルを手を動かしながら身につけ、「未経験だけどAIが使える人」として応募できます。",
  },
  {
    icon: "trend",
    title: "3週目から応募開始",
    body: "修了を待ちません。第3週から実際の応募を始め、選考を受けながら残りの研修で対策。だから6週間で「学んだ」だけでなく「動いた」状態になります。",
  },
];

export default function Features() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold tracking-[0.2em] text-teal">FEATURES</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          このプログラムが選ばれる3つの理由
        </h2>
        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
                  <Icon name={f.icon} className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-navy/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold leading-snug">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy/75">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
