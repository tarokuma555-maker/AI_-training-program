import Icon from "@/components/ui/Icon";
import MarkReadOnMount from "@/components/rooms/MarkReadOnMount";
import { formatDateTime } from "@/lib/format";
import { requireProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const profile = await requireProfile();
  const supabase = createSupabaseServerClient();

  const [{ data: annRows }, { data: readRows }] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false }),
    supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("student_id", profile.id),
  ]);
  const announcements = (annRows ?? []) as Announcement[];
  const readSet = new Set((readRows ?? []).map((r) => r.announcement_id as string));
  const unreadIds = announcements.filter((a) => !readSet.has(a.id)).map((a) => a.id);

  return (
    <div>
      <MarkReadOnMount unreadIds={unreadIds} />
      <h1 className="text-lg font-bold">掲示板</h1>
      {announcements.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-navy/60">
          お知らせはまだありません。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {announcements.map((a) => {
            const unread = !readSet.has(a.id);
            return (
              <li
                key={a.id}
                className={`rounded-2xl bg-white p-4 ${
                  unread ? "border-l-4 border-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {unread && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                      未読
                    </span>
                  )}
                  <p className="text-sm font-bold">{a.title}</p>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-navy/50">
                  <Icon name="pin" className="h-3 w-3" />
                  {formatDateTime(a.published_at)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy/80">
                  {a.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
