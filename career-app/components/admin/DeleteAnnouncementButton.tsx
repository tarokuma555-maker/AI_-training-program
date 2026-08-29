"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAnnouncement } from "@/app/admin/announcements/actions";

export default function DeleteAnnouncementButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("このお知らせを削除しますか？")) return;
    startTransition(async () => {
      const result = await deleteAnnouncement(id);
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
