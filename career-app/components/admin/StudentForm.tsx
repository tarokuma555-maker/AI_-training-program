"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/app/admin/students/actions";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function StudentForm({ defaultCohort }: { defaultCohort: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState("career");
  const [cohort, setCohort] = useState(defaultCohort);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createStudent({ name, email, track, cohort });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setName("");
        setEmail("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="block text-xs font-bold">氏名</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)}
          required maxLength={100} className={`${inputClass} mt-1`} placeholder="山田 太郎" />
      </div>
      <div>
        <label htmlFor="email" className="block text-xs font-bold">メールアドレス</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required className={`${inputClass} mt-1`} placeholder="taro@example.com" />
      </div>
      <div>
        <label htmlFor="track" className="block text-xs font-bold">トラック</label>
        <select id="track" value={track} onChange={(e) => setTrack(e.target.value)}
          className={`${inputClass} mt-1`}>
          <option value="career">転職トラック</option>
          <option value="skill">スキルトラック</option>
        </select>
      </div>
      <div>
        <label htmlFor="cohort" className="block text-xs font-bold">期</label>
        <input id="cohort" value={cohort} onChange={(e) => setCohort(e.target.value)}
          required className={`${inputClass} mt-1`} placeholder="2026-1" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "登録中…" : "受講生を登録"}
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
