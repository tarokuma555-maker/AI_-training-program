import ApplicationForm from "@/components/lp/ApplicationForm";

export default function ApplySection() {
  return (
    <section id="apply" className="bg-teal/10">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">申込フォーム</h2>
        <p className="mt-4 text-sm leading-relaxed text-navy/80 sm:text-base">
          下記フォームからお申し込みください。内容を確認のうえ、24時間以内にメールでご案内します。
        </p>
        <div className="mt-8 rounded-2xl bg-white/70 p-5 sm:p-8">
          <ApplicationForm />
        </div>
      </div>
    </section>
  );
}
