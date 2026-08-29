"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookSlot, cancelBooking } from "@/app/(student)/booking/actions";

function useAction() {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    });
  }
  return { message, isPending, run };
}

export function BookButton({ slotId }: { slotId: string }) {
  const { message, isPending, run } = useAction();
  return (
    <div className="text-right">
      <button
        onClick={() => run(() => bookSlot(slotId))}
        disabled={isPending}
        className="rounded-full bg-accent px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "予約中…" : "予約する"}
      </button>
      {message && !message.ok && (
        <p className="mt-1 text-xs font-bold text-accent">{message.text}</p>
      )}
    </div>
  );
}

export function CancelButton({ bookingId }: { bookingId: string }) {
  const { message, isPending, run } = useAction();
  return (
    <div className="text-right">
      <button
        onClick={() => {
          if (window.confirm("この予約をキャンセルしますか？")) {
            run(() => cancelBooking(bookingId));
          }
        }}
        disabled={isPending}
        className="rounded-full border border-navy/20 px-4 py-1.5 text-xs font-bold text-navy transition hover:bg-mist disabled:opacity-50"
      >
        {isPending ? "処理中…" : "キャンセル"}
      </button>
      {message && !message.ok && (
        <p className="mt-1 text-xs font-bold text-accent">{message.text}</p>
      )}
    </div>
  );
}
