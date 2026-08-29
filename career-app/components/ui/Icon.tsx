// 白抜きの線画アイコン（絵文字は使わない）
export type IconName =
  | "home"
  | "book"
  | "bot"
  | "cal"
  | "folder"
  | "board"
  | "pencil"
  | "trend"
  | "pin"
  | "user"
  | "users"
  | "play"
  | "file"
  | "box"
  | "lock"
  | "bell"
  | "clock"
  | "logout"
  | "check"
  | "sparkle";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5A3.5 3.5 0 0 0 8.5 3H3v15h6a3 3 0 0 1 3 3" />
      <path d="M12 6.5A3.5 3.5 0 0 1 15.5 3H21v15h-6a3 3 0 0 0-3 3" />
      <path d="M12 6.5V21" />
    </>
  ),
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 8V5" />
      <circle cx="12" cy="4" r="1" />
      <path d="M9.5 13.5h0" />
      <path d="M14.5 13.5h0" />
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
  folder: (
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  ),
  board: (
    <>
      <path d="M3 4h18" />
      <rect x="5" y="4" width="14" height="11" rx="1" />
      <path d="M12 15v3" />
      <path d="M8.5 21l3.5-3 3.5 3" />
    </>
  ),
  pencil: <path d="M16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20l1.5-4z" />,
  trend: (
    <>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M14.5 7H20v5.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.6-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 4.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.6" />
      <path d="M17.5 14.5A6 6 0 0 1 21 20" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.2 8.8l5.4 3.2-5.4 3.2z" />
    </>
  ),
  file: (
    <>
      <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
      <path d="M13.5 3v5.5H19" />
    </>
  ),
  box: (
    <>
      <path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2z" />
      <path d="M3 8.2l9 5.2 9-5.2" />
      <path d="M12 13.4V21" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  sparkle: (
    <>
      <path d="M12 4l1.8 4.6L18.5 10l-4.7 1.4L12 16l-1.8-4.6L5.5 10l4.7-1.4z" />
      <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
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
