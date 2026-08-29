const TZ = "Asia/Tokyo";

/** 「2026/09/01 19:00」形式（日本時間） */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "−";
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 「9/1（火） 19:00」形式（日本時間） */
export function formatSlot(iso: string | null | undefined): string {
  if (!iso) return "−";
  const d = new Date(iso);
  const date = d.toLocaleDateString("ja-JP", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const time = d.toLocaleTimeString("ja-JP", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

/** 「2026/09/01」形式（日本時間） */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "−";
  return new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
