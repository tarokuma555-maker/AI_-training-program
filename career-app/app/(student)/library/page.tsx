import Link from "next/link";
import Icon from "@/components/ui/Icon";
import RoomHeader from "@/components/rooms/RoomHeader";
import { formatDate } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Week } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("weeks")
    .select("*")
    .order("week_no")
    .order("track");
  const weeks = (data ?? []) as Week[];
  const now = new Date();

  return (
    <div>
      <RoomHeader
        icon="book"
        title="資料室"
        en="LIBRARY"
        desc="週ごとの棚に、動画・スライド・配布テンプレをまとめています。"
      />
      {weeks.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60">
          教材はまだ登録されていません。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {weeks.map((week) => {
            const locked = new Date(week.publish_at) > now;
            const inner = (
              <div
                className={`flex items-center gap-4 rounded-2xl p-4 ${
                  locked ? "bg-white/60 text-navy/40" : "bg-white"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    locked ? "bg-navy/10 text-navy/40" : "bg-navy text-white"
                  }`}
                >
                  {locked ? <Icon name="lock" className="h-5 w-5" /> : `${week.week_no}週`}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">
                    第{week.week_no}週　{week.title}
                  </span>
                  <span className="block text-xs">
                    {locked
                      ? `${formatDate(week.publish_at)} に公開予定`
                      : week.goal ?? ""}
                  </span>
                </span>
                {!locked && (
                  <span className="text-navy/30" aria-hidden>
                    →
                  </span>
                )}
              </div>
            );
            return (
              <li key={week.id}>
                {locked ? (
                  inner
                ) : (
                  <Link href={`/library/${week.id}`}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
