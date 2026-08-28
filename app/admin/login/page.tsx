"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setErrorMessage("");
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // 招待制：Supabaseに登録済みの管理者のみログイン可（新規作成しない）
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "ログインリンクを送信できませんでした。招待済みのメールアドレスかご確認ください。"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold">審査管理画面ログイン</h1>
        <p className="mt-2 text-sm text-navy/60">
          招待済みの管理者のみログインできます。
        </p>
        {sent ? (
          <p className="mt-6 rounded-xl bg-teal/10 px-4 py-4 text-sm leading-relaxed">
            ログインリンクをメールで送信しました。
            メール内のリンクを開いてログインしてください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              className="w-full rounded-xl border border-navy/20 px-4 py-3 text-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            {(errorMessage || authError) && (
              <p className="text-sm text-red-600">
                {errorMessage ||
                  "ログインに失敗しました。もう一度お試しください。"}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-navy px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "送信中…" : "ログインリンクを送信"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  // useSearchParams利用のためSuspenseで包む（Next.jsのプリレンダー要件）
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
