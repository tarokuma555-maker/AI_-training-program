import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/profile";

export const metadata = {
  title: "職員室",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-mist">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <p className="text-sm font-bold">職員室</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden text-white/70 sm:inline">{profile.name}</span>
            <Link href="/" className="rounded-full border border-white/30 px-3 py-1 font-bold">
              受講生画面へ
            </Link>
          </div>
        </div>
      </header>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
