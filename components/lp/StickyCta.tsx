"use client";

import { useEffect, useState } from "react";

/** スマホ用の追従CTA。ヒーローの申込ボタンを過ぎたら表示し、申込フォームが見えている間は隠す */
export default function StickyCta() {
  const [pastHeroCta, setPastHeroCta] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observers: IntersectionObserver[] = [];

    const heroCta = document.getElementById("hero-cta");
    if (heroCta) {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry) return;
        setPastHeroCta(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
      observer.observe(heroCta);
      observers.push(observer);
    }

    const apply = document.getElementById("apply");
    if (apply) {
      const observer = new IntersectionObserver(
        (entries) => setFormVisible(entries[0]?.isIntersecting ?? false),
        { rootMargin: "0px 0px -20% 0px" }
      );
      observer.observe(apply);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const show = pastHeroCta && !formVisible;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href="#apply"
        className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-bold text-white shadow-xl"
      >
        申込フォームへ
        <span className="text-xs font-normal text-white/80">
          （入力は約3分）
        </span>
      </a>
    </div>
  );
}
