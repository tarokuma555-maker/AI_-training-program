import Icon from "@/components/ui/Icon";
import TabNav from "@/components/ui/TabNav";
import { TRACK_LABELS } from "@/lib/constants";
import { requireProfile } from "@/lib/profile";

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            {/* 校章風エンブレム */}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40">
              <Icon name="book" className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight">
                AI実務プログラム
              </span>
              <span className="block text-[9px] font-bold tracking-[0.25em] text-white/50">
                ONLINE CLASSROOM
              </span>
            </span>
          </div>
          <p className="text-xs text-white/70">
            {profile.name}さん
            {profile.track ? `・${TRACK_LABELS[profile.track]}` : ""}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
      <TabNav isAdmin={profile.role === "admin"} />
    </div>
  );
}
