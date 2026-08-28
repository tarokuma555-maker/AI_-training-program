import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold">
              AI研修付き転職支援プログラム
            </p>
            <p className="mt-2 text-sm text-white/70">
              運営者：（運営者情報をここに記載）
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="text-white/80 hover:text-white">
              プライバシーポリシー
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-white/15 pt-6">
          <Link
            href="/skill"
            className="text-xs text-white/50 underline hover:text-white/80"
          >
            AIスキルのみ学びたい方向けの有料講座はこちら
          </Link>
          <p className="mt-4 text-xs text-white/40">
            &copy; {new Date().getFullYear()} AI研修付き転職支援プログラム
          </p>
        </div>
      </div>
    </footer>
  );
}
