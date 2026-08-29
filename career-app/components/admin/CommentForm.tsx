"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { commentSubmission } from "@/app/admin/assignments/actions";

export default function CommentForm({
  submissionId,
  initialComment,
}: {
  submissionId: string;
  initialComment: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState(initialComment);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await commentSubmission(submissionId, comment);
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={4000}
        className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        placeholder="受講生に届くコメント（1提出につき1つ。保存で上書き）"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-teal px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "保存中…" : "コメントを保存"}
        </button>
        {message && (
          <p className={`text-sm font-bold ${message.ok ? "text-teal" : "text-accent"}`}>
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
