/** AI質問室：1人1日の質問上限（環境変数で変更可・既定20） */
export function dailyLimit(): number {
  const n = Number(process.env.AI_CHAT_DAILY_LIMIT ?? "20");
  return Number.isInteger(n) && n > 0 ? n : 20;
}

/** 日本時間の「今日の0時」をISOで返す（レート制限の区切り） */
export function jstDayStartIso(): string {
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jstNow.getUTCFullYear();
  const m = String(jstNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jstNow.getUTCDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T00:00:00+09:00`).toISOString();
}
