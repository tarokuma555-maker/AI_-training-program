"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addJobApplication } from "@/app/(student)/tracker/actions";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function JobApplicationForm() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [appliedOn, setAppliedOn] = useState("");
  const [channel, setChannel] = useState("");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await addJobApplication({
        company,
        applied_on: appliedOn,
        channel,
        memo,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setCompany("");
        setAppliedOn("");
        setChannel("");
        setMemo("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-bold" htmlFor="company">企業名</label>
        <input id="company" value={company} onChange={(e) => setCompany(e.target.value)}
          required maxLength={200} className={`${inputClass} mt-1`} placeholder="株式会社〇〇" />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="appliedOn">応募日</label>
        <input id="appliedOn" type="date" value={appliedOn}
          onChange={(e) => setAppliedOn(e.target.value)} required
          className={`${inputClass} mt-1`} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="channel">応募経路（任意）</label>
        <input id="channel" value={channel} onChange={(e) => setChannel(e.target.value)}
          maxLength={100} className={`${inputClass} mt-1`}
          placeholder="例：求人サイト名・エージェント名・企業サイトから直接" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="memo">メモ（任意）</label>
        <textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)}
          rows={2} maxLength={2000} className={`${inputClass} mt-1`}
          placeholder="求人の内容や気になった点など" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "登録中…" : "応募を記録する"}
        </button>
        {message && (
          <p className={`mt-2 text-sm font-bold ${message.ok ? "text-teal" : "text-accent"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
