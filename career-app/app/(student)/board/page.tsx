import Icon from "@/components/ui/Icon";
import RoomHeader from "@/components/rooms/RoomHeader";
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
      <RoomHeader icon="pin" title="掲示板" en="BOARD" />
      {announcements.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-navy/60">
          お知らせはまだありません。
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {announcements.map((a, i) => {
            const unread = !readSet.has(a.id);
            return (
              <li
                key={a.id}
                className={`relative rounded-lg bg-white p-4 pt-5 shadow-sm ${
                  i % 2 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"
                } ${unread ? "ring-2 ring-accent/50" : ""}`}
              >
                {/* 画鋲 */}
                <span
                  aria-hidden
                  className={`absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow ${
                    unread ? "bg-accent" : "bg-teal"
                  }`}
                />
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
