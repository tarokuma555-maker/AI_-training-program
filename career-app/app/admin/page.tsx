import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

/** 要対応まとめ（週次運用の起点になるダッシュボード） */
export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const now = Date.now();

  const [
    { count: uncommented },
    { data: careerStudents },
    { data: jobApps },
    { data: attRows },
    { data: students },
    { data: futureBookings },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .is("admin_comment", null),
    supabase
      .from("profiles")
      .select("id")
      .eq("role", "student")
      .eq("track", "career"),
    supabase.from("job_applications").select("student_id, updated_at"),
    supabase.from("attendance").select("student_id, status"),
    supabase.from("profiles").select("id").eq("role", "student"),
    supabase
      .from("bookings")
      .select("student_id, slot:lesson_slots!inner(starts_at)")
      .eq("status", "booked")
      .gt("slot.starts_at", nowIso),
  ]);

  // 応募0件 or 1週間更新なし（転職トラック）
  const appsByStudent = new Map<string, string[]>();
  for (const a of jobApps ?? []) {
    const list = appsByStudent.get(a.student_id as string) ?? [];
    list.push(a.updated_at as string);
    appsByStudent.set(a.student_id as string, list);
  }
  let needsFollow = 0;
  for (const s of careerStudents ?? []) {
    const updates = appsByStudent.get(s.id as string);
    if (!updates || updates.length === 0) {
      needsFollow += 1;
      continue;
    }
    const latest = updates.reduce((a, b) => (a > b ? a : b));
    if (now - new Date(latest).getTime() > STALE_MS) needsFollow += 1;
  }

  // 無断欠席2回以上
  const absentByStudent = new Map<string, number>();
  for (const a of attRows ?? []) {
    if (a.status === "absent") {
      absentByStudent.set(
        a.student_id as string,
        (absentByStudent.get(a.student_id as string) ?? 0) + 1
      );
    }
  }
  const absentAlerts = [...absentByStudent.values()].filter((n) => n >= 2).length;

  // 今後の予約がない受講生
  const bookedIds = new Set(
    (futureBookings ?? []).map((b) => b.student_id as string)
  );
  const noBooking = (students ?? []).filter(
    (s) => !bookedIds.has(s.id as string)
  ).length;

  const cards: {
    href: string;
    icon: IconName;
    label: string;
    count: number;
    unit: string;
  }[] = [
    {
      href: "/admin/assignments",
      icon: "pencil",
      label: "未コメントの提出",
      count: uncommented ?? 0,
      unit: "件",
    },
    {
      href: "/admin/tracker",
      icon: "trend",
      label: "応募0件・1週間更新なし",
      count: needsFollow,
      unit: "名",
    },
    {
      href: "/admin/attendance",
      icon: "users",
      label: "無断欠席2回以上",
      count: absentAlerts,
      unit: "名",
    },
    {
      href: "/admin/slots",
      icon: "cal",
      label: "今後の予約がない受講生",
      count: noBooking,
      unit: "名",
    },
  ];

  const quickLinks = [
    { href: "/admin/students", label: "受講生" },
    { href: "/admin/materials", label: "教材" },
    { href: "/admin/announcements", label: "お知らせ" },
    { href: "/admin/ai-logs", label: "AIログ" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold">ダッシュボード</h1>
        <p className="mt-1 text-xs text-navy/60">要対応のまとめです。</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href + card.label}
            href={card.href}
            className={`rounded-2xl bg-white p-4 ${
              card.count > 0 ? "border-l-4 border-accent" : ""
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                card.count > 0 ? "bg-accent" : "bg-navy"
              } text-white`}
            >
              <Icon name={card.icon} className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-bold text-navy/60">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {card.count}
              <span className="ml-1 text-sm font-normal text-navy/50">
                {card.unit}
              </span>
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4">
        <p className="text-xs font-bold text-navy/60">その他の管理</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full bg-mist px-4 py-1.5 text-sm font-bold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
