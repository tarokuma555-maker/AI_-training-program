import ApplicationForm from "@/components/lp/ApplicationForm";

const reassurances = ["約3分で入力完了", "選考制・一次判定はAI", "24時間以内にご案内"];

export default function ApplySection() {
  return (
    <section id="apply" className="bg-teal/10">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold tracking-[0.2em] text-teal">APPLY</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">申込フォーム</h2>
        <p className="mt-4 text-sm leading-relaxed text-navy/80 sm:text-base">
          下記フォームからお申し込みください。内容を確認のうえ、24時間以内にメールでご案内します。
          最終的な受講可否は、無料相談（30分）でお話しした上で運営者が判断します。
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {reassurances.map((text) => (
            <li
              key={text}
              className="rounded-full border border-teal/30 bg-white px-4 py-1.5 text-xs font-bold text-teal"
            >
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl bg-white/70 p-5 shadow-sm sm:p-8">
          <ApplicationForm />
        </div>
      </div>
    </section>
  );
}
