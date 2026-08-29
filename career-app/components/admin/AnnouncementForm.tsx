"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/app/admin/announcements/actions";

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

export default function AnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [targetTrack, setTargetTrack] = useState("career");
  const [targetCohort, setTargetCohort] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createAnnouncement({
        title,
        body,
        target,
        target_track: targetTrack,
        target_cohort: targetCohort,
      });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) {
        setTitle("");
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="title">タイトル</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
          required maxLength={200} className={`${inputClass} mt-1`} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold" htmlFor="body">本文</label>
        <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)}
          rows={4} required maxLength={4000} className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label className="block text-xs font-bold" htmlFor="target">配信対象</label>
        <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}
          className={`${inputClass} mt-1`}>
          <option value="all">全体</option>
          <option value="track">トラック別</option>
          <option value="cohort">期別</option>
        </select>
      </div>
      {target === "track" && (
        <div>
          <label className="block text-xs font-bold" htmlFor="targetTrack">対象トラック</label>
          <select id="targetTrack" value={targetTrack}
            onChange={(e) => setTargetTrack(e.target.value)} className={`${inputClass} mt-1`}>
            <option value="career">転職トラック</option>
            <option value="skill">スキルトラック</option>
          </select>
        </div>
      )}
      {target === "cohort" && (
        <div>
          <label className="block text-xs font-bold" htmlFor="targetCohort">対象の期</label>
          <input id="targetCohort" value={targetCohort}
            onChange={(e) => setTargetCohort(e.target.value)}
            className={`${inputClass} mt-1`} placeholder="2026-1" />
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={isPending}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "配信中…" : "お知らせを配信"}
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
