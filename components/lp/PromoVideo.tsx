"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

/** ヒーロー最上部のプロモーション動画。無音で自動再生し、音声・再生はボタンで切り替える */
export default function PromoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // muted属性はサーバー描画のHTMLに出力されないことがあるため、ここで確実に無音にする
    // （ブラウザは音声付きの自動再生を許可しない）
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.play().catch(() => {});

    // 画面外では止めて、戻ってきたら再開する（自動で止めた場合のみ）
    let pausedOffscreen = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (!entry.isIntersecting && !video.paused) {
        pausedOffscreen = true;
        video.pause();
      } else if (entry.isIntersecting && pausedOffscreen) {
        pausedOffscreen = false;
        video.play().catch(() => {});
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.paused) video.play().catch(() => {});
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-navy shadow-2xl shadow-black/40 ring-1 ring-white/10 sm:rounded-2xl">
      <video
        ref={videoRef}
        src="/videos/promo.mp4"
        poster="/videos/promo-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="プログラム紹介動画（30秒）"
        aria-describedby="promo-transcript"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className="h-full w-full cursor-pointer object-cover"
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="動画を再生"
          className="absolute inset-0 flex items-center justify-center bg-navy/20"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-black/30 transition hover:scale-105 sm:h-20 sm:w-20">
            <Icon name="play" className="ml-0.5 h-5 w-5 sm:ml-1 sm:h-8 sm:w-8" />
          </span>
        </button>
      )}

      <div className="absolute bottom-2 right-2 flex gap-1.5 sm:bottom-4 sm:right-4 sm:gap-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "一時停止" : "再生"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60 sm:h-9 sm:w-9"
        >
          <Icon name={playing ? "pause" : "play"} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "音声をオンにする" : "音声をオフにする"}
          className="flex h-8 items-center gap-1 rounded-full bg-black/45 px-2.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/60 sm:h-9 sm:gap-1.5 sm:px-3 sm:text-xs"
        >
          <Icon name={muted ? "volumeOff" : "volume"} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {muted ? "音声オン" : "音声オフ"}
        </button>
      </div>

      <p id="promo-transcript" className="sr-only">
        飲食店長として、何年も。施工管理として、何年も。介護リーダーとして、何年も。
        その経験を、「未経験」で終わらせない。
        事務職・IT職に応募しても、書類が通らない。足りないのは、能力ではなく、応募先の選び方。
        同じ業界の、次の仕事（転換先の一例）：飲食店長から飲食SaaS企業のカスタマーサクセスへ。
        施工管理から建設テック企業の導入支援へ。介護リーダーから介護事業者の本部・運営企画へ。
        AI研修付き転職支援プログラム。6週間で、つなぐ。
        第1〜2週 経験の翻訳（Copilot実務研修）、第3週 応募開始（修了を待たない）、
        第4〜5週 選考対策（書類・面接）、第6週〜 伴走（入社後90日まで）。
        現場の経験を、次のキャリアの武器に。まずは無料相談（30分）。受講料は無料。少人数・選考制（定員5〜6名）。
      </p>
    </div>
  );
}
