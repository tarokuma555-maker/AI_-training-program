/** 日時を日本時間の「2026/08/28 12:34」形式にする */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "−";
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
