"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false, // 招待制：未登録アドレスは弾く
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (otpError) {
      // 原因の切り分けができるよう、Supabaseからのエラー内容も表示する
      setError(
        `ログインリンクを送信できませんでした。メールアドレスが登録済みかご確認ください。（詳細: ${otpError.message}）`
      );
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-mist p-5 text-sm leading-relaxed">
        <p className="font-bold">ログイン用リンクを送信しました</p>
        <p className="mt-2 text-navy/70">
          {email} 宛のメールに記載されたリンクを開くと、ログインが完了します。
          届かない場合は迷惑メールフォルダをご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-bold">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="例：taro@example.com"
          className="mt-2 w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-base focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-bold text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-navy px-8 py-3 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "送信中…" : "ログインリンクを送る"}
      </button>
    </form>
  );
}
