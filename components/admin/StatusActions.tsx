"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/app/admin/actions";

const buttons: { status: string; label: string; className: string }[] = [
  {
    status: "approved",
    label: "承認 → 無料相談案内へ",
    className: "bg-teal text-white",
  },
  {
    status: "waitlist",
    label: "見送り → 次期案内へ",
    className: "bg-navy text-white",
  },
  {
    status: "skill_route",
    label: "スキル講座案内へ",
    className: "bg-accent text-white",
  },
];

export default function StatusActions({
  id,
  initialNote,
}: {
  id: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(status: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateApplicationStatus(id, status, note);
      setMessage(result.message);
    });
  }

  return (
    <div>
      <label htmlFor="reviewerNote" className="block text-sm font-bold">
        審査メモ（任意）
      </label>
      <textarea
        id="reviewerNote"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={2000}
        className="mt-2 w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        placeholder="判断の理由や相談時のメモなど"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {buttons.map((b) => (
          <button
            key={b.status}
            onClick={() => handleClick(b.status)}
            disabled={isPending}
            className={`rounded-full px-5 py-3 text-sm font-bold transition hover:opacity-90 disabled:opacity-50 ${b.className}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      {isPending && (
        <p className="mt-3 text-sm text-navy/60">更新中…</p>
      )}
      {message && !isPending && (
        <p className="mt-3 text-sm font-bold text-teal">{message}</p>
      )}
    </div>
  );
}
