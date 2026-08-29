"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/students", label: "受講生" },
  { href: "/admin/materials", label: "教材" },
  { href: "/admin/assignments", label: "課題" },
  { href: "/admin/attendance", label: "出欠" },
  { href: "/admin/tracker", label: "応募" },
  { href: "/admin/slots", label: "面談枠" },
  { href: "/admin/announcements", label: "お知らせ" },
  { href: "/admin/ai-logs", label: "AIログ" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-5xl gap-1 px-4">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold ${
                active
                  ? "border-teal text-teal"
                  : "border-transparent text-navy/60 hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
