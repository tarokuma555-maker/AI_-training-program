import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-6 sm:p-8">
        <h1 className="text-xl font-bold">管理者ログイン</h1>
        <p className="mt-2 text-xs leading-relaxed text-navy/60">
          招待された管理者のみログインできます。アカウントはSupabaseダッシュボードから発行します。
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
