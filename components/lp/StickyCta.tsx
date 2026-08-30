"use client";

import { useEffect, useState } from "react";

/** スマホ用の追従CTA。ヒーローを過ぎたら表示し、申込フォームが見えている間は隠す */
export default function StickyCta() {
  const [scrolled, setScrolled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const apply = document.getElementById("apply");
    let observer: IntersectionObserver | null = null;
    if (apply && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => setFormVisible(entries[0]?.isIntersecting ?? false),
        { rootMargin: "0px 0px -20% 0px" }
      );
      observer.observe(apply);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  const show = scrolled && !formVisible;

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
