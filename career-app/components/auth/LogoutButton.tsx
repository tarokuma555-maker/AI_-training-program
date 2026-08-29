"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-white"
    >
      <Icon name="logout" className="h-4 w-4" />
      ログアウト
    </button>
  );
}
