import Link from "next/link";
import { TRACK_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiChatThread } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ThreadRow extends AiChatThread {
  student: { name: string; track: string | null } | null;
}

export default async function AdminAiLogsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("ai_chat_threads")
    .select("*, student:profiles(name, track)")
    .order("last_message_at", { ascending: false })
    .limit(200);
  const threads = (data ?? []) as unknown as ThreadRow[];

  return (
    <div className="rounded-2xl bg-white p-5">
      <h1 className="text-base font-bold">AI質問ログ</h1>
      <p className="mt-1 text-xs text-navy/60">
        よくある質問は講義の改善やFAQ化に活用してください（閲覧のみ）。
      </p>
      {threads.length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">まだ質問はありません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-navy/5">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/ai-logs/${t.id}`}
                className="flex items-center gap-3 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {t.title}
                  </span>
                  <span className="text-xs text-navy/50">
                    {t.student?.name ?? "不明"}
                    {t.student?.track ? `（${TRACK_LABELS[t.student.track]}）` : ""}
                    ・{formatDateTime(t.last_message_at)}
                  </span>
                </span>
                <span className="text-navy/30" aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
