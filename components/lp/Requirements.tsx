const requirements = [
  {
    title: "選考制",
    body: "申込フォームの内容をもとに一次判定を行い、通過された方と無料相談（30分）を実施します。最終的な受講可否は運営者が判断します。",
  },
  {
    title: "事前課題 3時間",
    body: "開講前に、経験の棚卸しシートの記入など約3時間の事前課題に取り組んでいただきます。",
  },
  {
    title: "週1回2時間＋課題2〜3時間",
    body: "週1回2時間の講義に加えて、週2〜3時間の課題時間を確保できることが受講の前提です。",
  },
  {
    title: "修了要件",
    body: "全回出席（録画補講を含む）と、3社以上への応募が修了の要件です。",
  },
];

export default function Requirements() {
  return (
    <section className="bg-base">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          受講の条件
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {requirements.map((r) => (
            <div key={r.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-3 text-lg font-bold">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
