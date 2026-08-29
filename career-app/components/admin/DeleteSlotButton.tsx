"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSlot } from "@/app/admin/slots/actions";

export default function DeleteSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("この枠を削除しますか？（予約も同時に削除されます）")) return;
    startTransition(async () => {
      const result = await deleteSlot(slotId);
      if (!result.ok) window.alert(result.message);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-bold text-accent underline underline-offset-2 disabled:opacity-50"
    >
      {isPending ? "削除中…" : "削除"}
    </button>
  );
}
