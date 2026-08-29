"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSlot } from "@/app/admin/slots/actions";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function SlotForm() {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("30");
  const [capacity, setCapacity] = useState("1");
  const [track, setTrack] = useState("");
  const [cohort, setCohort] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createSlot({
        starts_at: startsAt ? new Date(startsAt).toISOString() : "",
        duration_minutes: Number(duration),
        capacity: Number(capacity),
        track,
        cohort,
        note,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setStartsAt("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
      <div>
        <label className="block text-xs font-bold" htmlFor="startsAt">開始日時</label>
        <input id="startsAt" type="datetime-local" value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)} required
          className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="duration">所要時間（分）</label>
        <input id="duration" type="number" min={10} max={240} step={5} value={duration}
          onChange={(e) => setDuration(e.target.value)} className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="capacity">定員</label>
        <input id="capacity" type="number" min={1} max={100} value={capacity}
          onChange={(e) => setCapacity(e.target.value)} className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="track">対象トラック</label>
        <select id="track" value={track} onChange={(e) => setTrack(e.target.value)}
          className={`${inputClass} mt-1`}>
          <option value="">全トラック</option>
          <option value="career">転職トラック</option>
          <option value="skill">スキルトラック</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="cohort">対象の期（空欄で全期）</label>
        <input id="cohort" value={cohort} onChange={(e) => setCohort(e.target.value)}
          className={`${inputClass} mt-1`} placeholder="2026-1" />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="note">メモ（任意）</label>
        <input id="note" value={note} onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} mt-1`} placeholder="例：Zoomで実施" />
      </div>
      <div className="sm:col-span-3">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "作成中…" : "面談枠を作成"}
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
