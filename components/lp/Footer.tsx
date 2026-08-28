import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="space-y-2 text-sm text-mist/80">
          <p className="font-bold text-white">運営者情報</p>
          <p>運営者：●●●●（正式表記に差し替え予定）</p>
          <p>お問い合わせ：contact@example.com（差し替え予定）</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link href="/privacy" className="underline underline-offset-4">
            プライバシーポリシー
          </Link>
          <Link
            href="/skill"
            className="text-xs text-mist/60 underline underline-offset-4"
          >
            AIスキルのみ学びたい方向けの有料講座はこちら
          </Link>
        </div>
        <p className="mt-8 text-xs text-mist/50">
          © {new Date().getFullYear()} AI研修付き転職支援プログラム
        </p>
      </div>
    </footer>
  );
}
