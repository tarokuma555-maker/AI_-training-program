import Link from "next/link";

export const dynamic = "force-dynamic";

// フェーズ6で「要対応まとめ」に置き換える予定のプレースホルダ
export default function AdminDashboardPage() {
  const links = [
    { href: "/admin/students", title: "受講生", desc: "登録・一覧" },
    { href: "/admin/materials", title: "教材", desc: "週と教材の管理" },
    { href: "/admin/assignments", title: "課題", desc: "提出マトリクス" },
    { href: "/admin/attendance", title: "出欠", desc: "週×受講生の記録" },
    { href: "/admin/tracker", title: "応募", desc: "応募ダッシュボード" },
    { href: "/admin/slots", title: "面談枠", desc: "枠の作成・予約状況" },
    { href: "/admin/announcements", title: "お知らせ", desc: "配信・一覧" },
    { href: "/admin/ai-logs", title: "AIログ", desc: "質問ログの閲覧" },
  ];

  return (
    <div>
      <h1 className="text-lg font-bold">ダッシュボード</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl bg-white p-4">
            <p className="text-sm font-bold">{l.title}</p>
            <p className="mt-1 text-xs text-navy/60">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
