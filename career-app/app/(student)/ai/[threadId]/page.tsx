import Link from "next/link";
import { notFound } from "next/navigation";
import ChatThread from "@/components/rooms/ChatThread";
import { dailyLimit, jstDayStartIso } from "@/lib/ai/rate";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiChatMessage, AiChatThread } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AiThreadPage({
  params,
}: {
  params: { threadId: string };
}) {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const { data: threadData } = await supabase
    .from("ai_chat_threads")
    .select("*")
    .eq("id", params.threadId)
    .maybeSingle();
  const thread = (threadData ?? null) as AiChatThread | null;
  if (!thread || thread.student_id !== profile.id) notFound();

  const [{ data: messageRows }, { count }] = await Promise.all([
    supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("thread_id", thread.id)
      .order("created_at"),
    supabase
      .from("ai_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .eq("role", "user")
      .gte("created_at", jstDayStartIso()),
  ]);
  const messages = (messageRows ?? []) as Pick<
    AiChatMessage,
    "role" | "content"
  >[];
  const remaining = Math.max(0, dailyLimit() - (count ?? 0));

  return (
    <div>
      <Link href="/ai" className="text-sm text-teal underline underline-offset-4">
        ← AI質問室へ戻る
      </Link>
      <h1 className="mt-2 truncate text-base font-bold">{thread.title}</h1>
      <div className="mt-4">
        <ChatThread
          threadId={thread.id}
          initialMessages={messages}
          initialRemaining={remaining}
        />
      </div>
    </div>
  );
}
