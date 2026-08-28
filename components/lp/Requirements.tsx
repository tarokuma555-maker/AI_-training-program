const requirements = [
  {
    label: "選考制",
    body: "申込フォームの内容をもとに、無料相談（30分）でお話しした上で受講を決定します。",
  },
  {
    label: "事前課題",
    body: "受講開始までに約3時間の事前課題に取り組んでいただきます。",
  },
  {
    label: "時間の確保",
    body: "週1回2時間の講義に加え、課題に週2〜3時間を確保できることが条件です。",
  },
  {
    label: "修了要件",
    body: "全回出席と、3社以上への応募が修了の要件です。",
  },
];

export default function Requirements() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">受講の条件</h2>
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6">
          {requirements.map((r) => (
            <div key={r.label} className="rounded-2xl bg-white p-6 sm:p-7">
              <p className="inline-block rounded-full bg-navy px-4 py-1 text-sm font-bold text-white">
                {r.label}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-navy/80 sm:text-base">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
