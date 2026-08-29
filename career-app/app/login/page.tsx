import Icon from "@/components/ui/Icon";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
          <Icon name="book" className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-xl font-bold">受講生アプリ ログイン</h1>
        <p className="mt-2 text-xs leading-relaxed text-navy/60">
          登録済みのメールアドレスにログイン用リンクをお送りします。
          このアプリは招待制です。登録がないメールアドレスは利用できません。
        </p>
        {searchParams.error === "auth" && (
          <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-navy">
            リンクの有効期限が切れているか、無効なリンクです。もう一度お試しください。
          </p>
        )}
        {searchParams.error === "no_profile" && (
          <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-navy">
            受講生情報が見つかりません。運営者にお問い合わせください。
          </p>
        )}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
