const conditions = [
  "現場で判断・管理を担ってきた",
  "同じ業界で働き続けたい",
  "事務職・IT職の応募で書類が通らなかった経験がある",
];

export default function ForWhom() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">こんな方へ</h2>
        <ul className="mt-8 space-y-4 sm:mt-10">
          {conditions.map((text) => (
            <li
              key={text}
              className="flex items-start gap-4 rounded-2xl bg-mist p-5 sm:p-6"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">
                ✓
              </span>
              <p className="text-base leading-relaxed sm:text-lg">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-navy/70">
          飲食店長・施工管理・介護職など、現場での経験を積んできた方を対象に、
          同じ業界のホワイトカラー職への転職を支援します。
        </p>
      </div>
    </section>
  );
}
