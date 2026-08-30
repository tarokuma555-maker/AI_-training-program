const conditions = [
  "現場で判断・管理を担ってきた",
  "同じ業界で働き続けたい",
  "事務職・IT職の応募で書類が通らなかった経験がある",
];

export default function ForWhom() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold tracking-[0.2em] text-teal">FOR YOU</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          ひとつでも当てはまったら、
          <br className="sm:hidden" />
          このプログラムはあなた向けです
        </h2>
        <ul className="mt-8 space-y-4 sm:mt-10">
          {conditions.map((text) => (
            <li
              key={text}
              className="flex items-start gap-4 rounded-2xl bg-mist p-5 transition hover:bg-teal/10 sm:p-6"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <p className="text-base font-medium leading-relaxed sm:text-lg">
                {text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-navy/70 sm:text-base">
          飲食店長・施工管理・介護職など、現場での経験を積んできた方を対象に、
          同じ業界のホワイトカラー職への転職を支援します。
          経験がないのは「オフィスワーク」だけ。業界の知識と現場感覚は、
          もう十分に持っています。
        </p>
      </div>
    </section>
  );
}
