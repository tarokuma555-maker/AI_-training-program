"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewQuestionForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && json.threadId) {
        router.push(`/ai/${json.threadId}`);
        return;
      }
      setError(json?.message ?? "送信に失敗しました。時間をおいてお試しください。");
    } catch {
      setError("通信に失敗しました。電波状況をご確認ください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={4000}
        disabled={disabled || sending}
        className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50"
        placeholder={
          disabled
            ? "本日の質問回数の上限に達しました"
            : "例：Copilotで議事録を要約するときのコツを教えてください"
        }
      />
      {error && (
        <p role="alert" className="text-sm font-bold text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={disabled || sending || !message.trim()}
        className="w-full rounded-full bg-accent px-8 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {sending ? "回答を作成中…（少しお待ちください）" : "質問する"}
      </button>
    </form>
  );
}
