import { STATUS_LABELS } from "@/lib/applications";

const badgeStyles: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  ai_reviewed: "bg-teal/10 text-teal",
  approved: "bg-green-100 text-green-700",
  waitlist: "bg-amber-100 text-amber-700",
  skill_route: "bg-indigo-100 text-indigo-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
        badgeStyles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
