// 白抜きの線画アイコン（LP用・受講生アプリと同一トーン）
export type IconName =
  | "check"
  | "sparkle"
  | "trend"
  | "clock"
  | "cal"
  | "book"
  | "shield"
  | "wallet"
  | "pencil"
  | "users"
  | "arrow";

const paths: Record<IconName, React.ReactNode> = {
  check: <path d="M20 6 9 17l-5-5" />,
  sparkle: (
    <>
      <path d="M12 4l1.8 4.6L18.5 10l-4.7 1.4L12 16l-1.8-4.6L5.5 10l4.7-1.4z" />
      <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M14.5 7H20v5.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  cal: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 3v4" />
      <path d="M15 3v4" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5A3.5 3.5 0 0 0 8.5 3H3v15h6a3 3 0 0 1 3 3" />
      <path d="M12 6.5A3.5 3.5 0 0 1 15.5 3H21v15h-6a3 3 0 0 0-3 3" />
      <path d="M12 6.5V21" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M15 15h3" />
    </>
  ),
  pencil: <path d="M16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20l1.5-4z" />,
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.6" />
      <path d="M17.5 14.5A6 6 0 0 1 21 20" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
};

export default function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 2,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
