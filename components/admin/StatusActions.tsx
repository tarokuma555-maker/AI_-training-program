"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  reviewApplication,
  type ReviewStatus,
} from "@/app/actions/review-application";

const actions: Array<{
  status: ReviewStatus;
  label: string;
  className: string;
}> = [
  {
    status: "approved",
    label: "承認（無料相談案内へ）",
    className: "bg-green-600 hover:bg-green-700",
  },
  {
    status: "waitlist",
    label: "見送り（次期案内へ）",
    className: "bg-amber-600 hover:bg-amber-700",
  },
  {
    status: "skill_route",
    label: "スキル講座案内へ",
    className: "bg-indigo-600 hover:bg-indigo-700",
  },
];

export default function StatusActions({
  applicationId,
  initialNote,
}: {
  applicationId: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [submitting, setSubmitting] = useState<ReviewStatus | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAction = async (status: ReviewStatus) => {
    if (submitting) return;
    setSubmitting(status);
    setMessage("");
    try {
      const result = await reviewApplication({
        id: applicationId,
        status,
        reviewerNote: note,
      });
      if (result.ok) {
        setMessage("ステータスを更新しました。");
        router.refresh();
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("更新に失敗しました。再度お試しください。");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-bold">
          審査メモ（任意・ステータス変更時に保存されます）
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="例：無料相談で希望職種の解像度を確認する"
          className="w-full rounded-xl border border-navy/20 px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={submitting !== null}
            onClick={() => handleAction(action.status)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${action.className}`}
          >
            {submitting === action.status ? "更新中…" : action.label}
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-navy/70">{message}</p>}
    </div>
  );
}
