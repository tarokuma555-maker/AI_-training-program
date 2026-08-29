"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/app/admin/assignments/actions";
import { WEEK_TRACK_LABELS } from "@/lib/constants";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-3 py-2 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function AssignmentForm({
  weeks,
}: {
  weeks: { id: string; week_no: number; title: string; track: string }[];
}) {
  const router = useRouter();
  const [weekId, setWeekId] = useState(weeks[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [track, setTrack] = useState("common");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createAssignment({
        week_id: weekId,
        title,
        description,
        due_at: dueAt ? new Date(dueAt).toISOString() : "",
        track,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setTitle("");
        setDescription("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-bold" htmlFor="weekId">週</label>
        <select id="weekId" value={weekId} onChange={(e) => setWeekId(e.target.value)}
          className={`${inputClass} mt-1`}>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              第{w.week_no}週（{WEEK_TRACK_LABELS[w.track]}）{w.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="track">対象トラック</label>
        <select id="track" value={track} onChange={(e) => setTrack(e.target.value)}
          className={`${inputClass} mt-1`}>
          <option value="common">共通</option>
          <option value="career">転職トラック</option>
          <option value="skill">スキルトラック</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="title">タイトル</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
          required className={`${inputClass} mt-1`} placeholder="例：職務経歴の棚卸しシートを埋める" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="description">説明</label>
        <textarea id="description" value={description}
          onChange={(e) => setDescription(e.target.value)} rows={4} required
          className={`${inputClass} mt-1`}
          placeholder="課題の内容・提出物・進め方のヒントなど" />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="dueAt">締切</label>
        <input id="dueAt" type="datetime-local" value={dueAt}
          onChange={(e) => setDueAt(e.target.value)} required
          className={`${inputClass} mt-1`} />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "作成中…" : "課題を作成"}
        </button>
      </div>
      {message && (
        <p className={`sm:col-span-2 text-sm font-bold ${message.ok ? "text-teal" : "text-accent"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
