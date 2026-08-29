"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAttendance } from "@/app/admin/attendance/actions";

const styles: Record<string, string> = {
  "": "bg-white text-navy/40",
  present: "bg-teal/15 text-teal",
  recorded: "bg-navy/10 text-navy",
  absent: "bg-accent/20 text-accent",
};

export default function AttendanceCell({
  weekId,
  studentId,
  current,
}: {
  weekId: string;
  studentId: string;
  current: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    setValue(next);
    startTransition(async () => {
      const result = await setAttendance(weekId, studentId, next);
      if (!result.ok) {
        window.alert(result.message);
        setValue(current);
      }
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className={`w-full rounded-lg border border-navy/10 px-1 py-1.5 text-center text-xs font-bold disabled:opacity-50 ${styles[value] ?? ""}`}
    >
      <option value="">未記録</option>
      <option value="present">出席</option>
      <option value="recorded">録画補講</option>
      <option value="absent">欠席</option>
    </select>
  );
}
