"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Close } from "./icons";

export type LightItem = { src: string; alt: string; caption?: string; w?: number };

/**
 * Полноэкранный просмотр: стрелки, Esc, свайп. Фото не растягивается
 * больше своего реального размера — поэтому не «мылится».
 */
export function Lightbox({ items, index, onClose }: { items: LightItem[]; index: number | null; onClose: () => void }) {
  const [i, setI] = useState(index ?? 0);
  const touch = useRef<number | null>(null);
  const open = index !== null;

  useEffect(() => {
    if (index !== null) setI(index);
  }, [index]);

  const go = useCallback((d: number) => setI((v) => (v + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", key);
    };
  }, [open, go, onClose]);

  if (!open || !items[i]) return null;
  const it = items[i];

  return (
    <div
      className="fade-in fixed inset-0 z-[60] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="num font-mono text-[12px] text-mute">
          {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={onClose} aria-label="Закрыть" className="grid h-11 w-11 place-items-center rounded-full text-bone transition-colors hover:bg-white/10">
          <Close />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={onClose}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={it.src}
          src={it.src}
          alt={it.alt}
          onClick={(e) => e.stopPropagation()}
          className="modal-in max-h-full w-auto rounded-xl object-contain"
          style={{ maxWidth: it.w ? `min(100%, ${it.w}px)` : "100%" }}
        />
        {items.length > 1 && (
          <>
            <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Назад" className="lb-nav left-3 sm:left-6">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Вперёд" className="lb-nav right-3 sm:right-6">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      <p className="min-h-[52px] px-6 py-4 text-center font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-bone/80">{it.caption ?? ""}</p>
    </div>
  );
}
