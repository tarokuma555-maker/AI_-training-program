"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWeek } from "@/app/admin/materials/actions";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function WeekForm() {
  const router = useRouter();
  const [weekNo, setWeekNo] = useState("1");
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [track, setTrack] = useState("common");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createWeek({
        week_no: Number(weekNo),
        title,
        goal,
        publish_at: publishAt ? new Date(publishAt).toISOString() : "",
        track,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setTitle("");
        setGoal("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-bold" htmlFor="weekNo">週番号</label>
        <select id="weekNo" value={weekNo} onChange={(e) => setWeekNo(e.target.value)}
          className={`${inputClass} mt-1`}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>第{n}週</option>
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
          required className={`${inputClass} mt-1`} placeholder="例：経験の棚卸しとAI基礎" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="goal">この週のゴール（任意）</label>
        <input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}
          className={`${inputClass} mt-1`} placeholder="例：職務経歴の材料を洗い出し、Copilotの基本操作に慣れる" />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="publishAt">公開日時</label>
        <input id="publishAt" type="datetime-local" value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)} required
          className={`${inputClass} mt-1`} />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "作成中…" : "週を作成"}
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
