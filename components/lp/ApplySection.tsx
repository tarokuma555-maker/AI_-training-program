export default function ApplySection() {
  return (
    <section id="apply" className="bg-teal/10">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="text-2xl font-bold sm:text-3xl">申込フォーム</h2>
        <p className="mt-4 text-sm leading-relaxed text-navy/80 sm:text-base">
          下記フォームからお申し込みください。内容を確認のうえ、24時間以内にメールでご案内します。
        </p>
        {/* フェーズ2で申込フォームを実装します */}
        <div className="mt-8 rounded-2xl border border-dashed border-teal/40 bg-white p-8 text-center text-sm text-navy/60">
          申込フォームは準備中です（フェーズ2で実装）
        </div>
      </div>
    </section>
  );
}
