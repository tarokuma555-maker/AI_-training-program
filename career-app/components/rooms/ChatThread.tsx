"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatThread({
  threadId,
  initialMessages,
  initialRemaining,
}: {
  threadId: string;
  initialMessages: ChatMessage[];
  initialRemaining: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, sending]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (sending || !text) return;
    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && json.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.reply },
        ]);
        if (typeof json.remaining === "number") setRemaining(json.remaining);
      } else {
        setError(json?.message ?? "回答の取得に失敗しました。もう一度お試しください。");
      }
    } catch {
      setError("通信に失敗しました。電波状況をご確認ください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md bg-navy text-white"
                  : "rounded-bl-md bg-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-navy/50">
              回答を作成中…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-accent">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="sticky bottom-24 mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4000}
          disabled={sending || remaining <= 0}
          className="flex-1 rounded-full border border-navy/20 bg-white px-5 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50"
          placeholder={
            remaining <= 0 ? "本日の上限に達しました" : "続けて質問する"
          }
        />
        <button
          type="submit"
          disabled={sending || remaining <= 0 || !input.trim()}
          className="shrink-0 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          送信
        </button>
      </form>
      <p className="mt-2 text-right text-xs text-navy/50">
        本日の残り質問数：{remaining}問
      </p>
    </div>
  );
}
