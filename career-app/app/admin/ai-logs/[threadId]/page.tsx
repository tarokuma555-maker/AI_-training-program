import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiChatMessage, AiChatThread } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAiLogDetailPage({
  params,
}: {
  params: { threadId: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: threadData } = await supabase
    .from("ai_chat_threads")
    .select("*, student:profiles(name)")
    .eq("id", params.threadId)
    .maybeSingle();
  if (!threadData) notFound();
  const thread = threadData as unknown as AiChatThread & {
    student: { name: string } | null;
  };

  const { data: messageRows } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at");
  const messages = (messageRows ?? []) as AiChatMessage[];

  return (
    <div>
      <Link
        href="/admin/ai-logs"
        className="text-sm text-teal underline underline-offset-4"
      >
        ← AI質問ログへ戻る
      </Link>
      <h1 className="mt-2 text-base font-bold">{thread.title}</h1>
      <p className="text-xs text-navy/60">
        {thread.student?.name ?? "不明"}・開始 {formatDateTime(thread.created_at)}
      </p>

      <div className="mt-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
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
              <span
                className={`mt-1 block text-right text-[10px] ${
                  m.role === "user" ? "text-white/50" : "text-navy/40"
                }`}
              >
                {formatDateTime(m.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
