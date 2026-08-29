"use client";

import { useEffect, useRef } from "react";
import { markAnnouncementsRead } from "@/app/(student)/board/actions";

/** 掲示板を開いたときに未読を既読化する（表示中の未読ハイライトはそのまま残す） */
export default function MarkReadOnMount({ unreadIds }: { unreadIds: string[] }) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || unreadIds.length === 0) return;
    done.current = true;
    void markAnnouncementsRead(unreadIds);
  }, [unreadIds]);

  return null;
}
