import Link from "next/link";
import Icon from "@/components/ui/Icon";
import NewQuestionForm from "@/components/rooms/NewQuestionForm";
import RoomHeader from "@/components/rooms/RoomHeader";
import { dailyLimit, jstDayStartIso } from "@/lib/ai/rate";
import { formatDateTime } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiChatThread } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AiRoomPage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const [{ data: threadRows }, { count }] = await Promise.all([
    supabase
      .from("ai_chat_threads")
      .select("*")
      .eq("student_id", profile.id)
      .order("last_message_at", { ascending: false }),
    supabase
      .from("ai_chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("student_id", profile.id)
      .eq("role", "user")
      .gte("created_at", jstDayStartIso()),
  ]);
  const threads = (threadRows ?? []) as AiChatThread[];
  const remaining = Math.max(0, dailyLimit() - (count ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <RoomHeader
          icon="bot"
          title="AI質問室"
          en="AI TUTOR"
          right={
            <span className="shrink-0 rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
              本日あと{remaining}問
            </span>
          }
        />
        <p className="mt-2 rounded-xl bg-white p-4 text-xs leading-relaxed text-navy/70">
          講義内容の復習・Copilotの操作・課題の考え方について、AIチューターに質問できます。
          AIの回答は学習の補助です。応募や選考に関する個別のご相談は、週次面談で講師にお声がけください。
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Icon name="sparkle" className="h-4 w-4 text-accent" />
          新しく質問する
        </h2>
        <NewQuestionForm disabled={remaining <= 0} />
      </section>

      <section>
        <h2 className="text-sm font-bold">これまでの質問</h2>
        {threads.length === 0 ? (
          <p className="mt-2 rounded-2xl bg-white p-5 text-sm text-navy/60">
            まだ質問はありません。
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/ai/${t.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                    <Icon name="bot" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {t.title}
                    </span>
                    <span className="text-xs text-navy/50">
                      {formatDateTime(t.last_message_at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
