"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteJobApplication,
  updateJobApplication,
} from "@/app/(student)/tracker/actions";
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import type { JobApplication } from "@/lib/types";

const statusStyles: Record<string, string> = {
  applied: "bg-navy/10 text-navy",
  doc_passed: "bg-teal/15 text-teal",
  interview_scheduling: "bg-teal/15 text-teal",
  interviewed: "bg-teal text-white",
  offer: "bg-accent text-white",
  rejected: "bg-navy/10 text-navy/50",
};

export default function JobApplicationCard({ app }: { app: JobApplication }) {
  const router = useRouter();
  const [status, setStatus] = useState(app.status as string);
  const [memo, setMemo] = useState(app.memo ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateJobApplication(app.id, { status, memo });
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`「${app.company}」の記録を削除しますか？`)) return;
    startTransition(async () => {
      const result = await deleteJobApplication(app.id);
      if (!result.ok) setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{app.company}</p>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[app.status]}`}
        >
          {JOB_STATUS_LABELS[app.status]}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy/60">
        応募日 {formatDate(app.applied_on)}
        {app.channel ? `・${app.channel}` : ""}・更新 {formatDateTime(app.updated_at)}
      </p>
      {app.memo && (
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-navy/80">
          {app.memo}
        </p>
      )}

      <details className="mt-3 rounded-xl bg-mist/70 p-3">
        <summary className="cursor-pointer text-xs font-bold text-navy/70">
          ステータス・メモを更新
        </summary>
        <div className="mt-3 space-y-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-navy/20 bg-white px-3 py-2 text-sm"
          >
            {JOB_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {JOB_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            maxLength={2000}
            className="w-full rounded-xl border border-navy/20 bg-white px-3 py-2 text-sm"
            placeholder="メモ（面接日程・感触・次のアクションなど）"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full bg-teal px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              {isPending ? "保存中…" : "保存"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs font-bold text-accent underline underline-offset-2 disabled:opacity-50"
            >
              削除
            </button>
            {message && <p className="text-xs font-bold text-teal">{message}</p>}
          </div>
        </div>
      </details>
    </div>
  );
}
