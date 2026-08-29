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
          <p className="text-sm font-bold">AI実務プログラム</p>
          <p className="text-xs text-white/70">
            {profile.name}
            {profile.track ? `・${TRACK_LABELS[profile.track]}` : ""}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
      <TabNav isAdmin={profile.role === "admin"} />
    </div>
  );
}
