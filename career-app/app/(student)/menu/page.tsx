import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { requireProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const profile = await requireProfile();

  const rooms: { href: string; icon: IconName; title: string; desc: string }[] = [
    {
      href: "/assignments",
      icon: "pencil",
      title: "課題提出室",
      desc: "課題の確認・提出、講師からのコメント",
    },
    ...(profile.track === "career"
      ? [
          {
            href: "/tracker",
            icon: "trend" as IconName,
            title: "応募トラッカー室",
            desc: "応募の記録とステータス管理",
          },
        ]
      : []),
    {
      href: "/board",
      icon: "pin",
      title: "掲示板",
      desc: "運営からのお知らせ",
    },
    {
      href: "/mypage",
      icon: "user",
      title: "マイページ",
      desc: "登録情報・出席と提出の記録・ログアウト",
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-bold">その他の部屋</h1>
      <ul className="mt-4 space-y-3">
        {rooms.map((room) => (
          <li key={room.href}>
            <Link
              href={room.href}
              className="flex items-center gap-4 rounded-2xl bg-white p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
                <Icon name={room.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold">{room.title}</span>
                <span className="block text-xs text-navy/60">{room.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
