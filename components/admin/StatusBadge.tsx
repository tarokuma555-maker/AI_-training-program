import { STATUS_LABELS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";

const styles: Record<ApplicationStatus, string> = {
  pending: "bg-navy/10 text-navy",
  ai_reviewed: "bg-teal/15 text-teal",
  approved: "bg-teal text-white",
  waitlist: "bg-navy text-white",
  skill_route: "bg-accent text-white",
};

export default function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
