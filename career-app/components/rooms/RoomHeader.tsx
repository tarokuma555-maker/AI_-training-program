import Icon, { type IconName } from "@/components/ui/Icon";

/** 教室のドアプレート風の見出し（各部屋ページ共通） */
export default function RoomHeader({
  icon,
  title,
  en,
  desc,
  right,
}: {
  icon: IconName;
  title: string;
  en: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3 rounded-lg border-b-4 border-black/20 bg-navy px-4 py-2.5 text-white">
          <Icon name={icon} className="h-5 w-5" />
          <span className="text-base font-bold tracking-wide">{title}</span>
          <span className="border-l border-white/25 pl-3 text-[10px] font-bold tracking-[0.2em] text-white/60">
            {en}
          </span>
        </div>
        {right}
      </div>
      {desc && <p className="mt-2 text-xs leading-relaxed text-navy/60">{desc}</p>}
    </div>
  );
}
