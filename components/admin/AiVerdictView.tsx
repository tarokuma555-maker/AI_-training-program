import type { ScreeningVerdict } from "@/lib/ai/screening";
import { SCREENING_ITEM_LABELS } from "@/lib/types";

const ITEM_KEYS = [
  "q2_specific_goal",
  "q4_judgment_experience",
  "q3_q5_realistic",
] as const;

export default function AiVerdictView({
  verdict,
  recommendation,
  compact = false,
}: {
  verdict: ScreeningVerdict | null;
  recommendation: "pass" | "review" | null;
  compact?: boolean;
}) {
  if (!verdict || !recommendation) {
    return <span className="text-xs text-navy/50">未判定</span>;
  }

  return (
    <div className="space-y-1.5">
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
          recommendation === "pass"
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {recommendation === "pass" ? "一次通過（pass）" : "要確認（review）"}
        ・YES {verdict.yes_count}/3
      </span>
      <ul className={compact ? "space-y-0.5" : "space-y-2"}>
        {ITEM_KEYS.map((key) => {
          const item = verdict[key];
          if (!item) return null;
          return (
            <li key={key} className="text-xs leading-relaxed text-navy/75">
              <span
                className={`mr-1 font-bold ${
                  item.verdict === "YES" ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.verdict === "YES" ? "○" : "×"}
              </span>
              {!compact && (
                <span className="mr-1 font-medium">
                  {SCREENING_ITEM_LABELS[key]}：
                </span>
              )}
              <span className={compact ? "line-clamp-1" : ""}>
                {item.reason}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
