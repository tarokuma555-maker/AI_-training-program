import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutAdmin } from "@/app/actions/review-application";

export const metadata: Metadata = {
  title: "審査管理画面",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="rounded-2xl bg-white p-6 text-sm leading-relaxed text-navy/75 shadow-sm">
          Supabaseの環境変数が未設定のため、管理画面を利用できません。
          `.env.local` に NEXT_PUBLIC_SUPABASE_URL と
          NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください（READMEのフェーズ2参照）。
        </p>
      </div>
    );
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-base">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-base font-bold">
            審査管理画面
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/70 sm:inline">{user.email}</span>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs transition hover:bg-white/10"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
