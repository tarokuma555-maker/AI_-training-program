"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/Icon";

interface Tab {
  href: string;
  label: string;
  icon: IconName;
}

const baseTabs: Tab[] = [
  { href: "/", label: "ホーム", icon: "home" },
  { href: "/library", label: "資料室", icon: "book" },
  { href: "/ai", label: "AI質問", icon: "bot" },
  { href: "/booking", label: "予約", icon: "cal" },
  { href: "/menu", label: "その他", icon: "folder" },
];

export default function TabNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = isAdmin
    ? [...baseTabs, { href: "/admin", label: "職員室", icon: "board" as IconName }]
    : baseTabs;

  // 「その他」配下の部屋でもタブをアクティブにする
  const menuChildren = ["/menu", "/assignments", "/tracker", "/board", "/mypage"];

  function isActive(tab: Tab): boolean {
    if (tab.href === "/") return pathname === "/";
    if (tab.href === "/menu") return menuChildren.some((p) => pathname.startsWith(p));
    return pathname.startsWith(tab.href);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-navy/10 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-3xl auto-cols-fr grid-flow-col">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold ${
                active ? "text-teal" : "text-navy/50"
              }`}
            >
              <Icon name={tab.icon} className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
