"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { useContacts } from "./ContactsContext";
import { Phone, Plane } from "./icons";

/** Не больше одного rAF на кадр, и только когда что-то скроллится. */
function useScrollFrame(cb: () => void) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        ref.current();
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
}

/** Прогресс чтения под шапкой — transform: scaleX. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
  });
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/**
 * Ток по проводу этапов: провод заполняется, искра бежит впереди,
 * шаги загораются, когда ток до них дошёл. Только transform + класс.
 */
export function useWireProgress(
  list: React.RefObject<HTMLOListElement | null>,
  fill: React.RefObject<HTMLSpanElement | null>,
  spark: React.RefObject<HTMLSpanElement | null>,
) {
  useScrollFrame(() => {
    const el = list.current;
    if (!el || !fill.current) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.62 - r.top) / r.height));
    fill.current.style.transform = `scaleY(${p.toFixed(4)})`;
    if (spark.current) {
      const track = fill.current.parentElement!.getBoundingClientRect().height;
      spark.current.style.transform = `translate3d(0, ${(track * p - 4.5).toFixed(1)}px, 0)`;
      spark.current.style.opacity = p > 0.01 && p < 0.995 ? "1" : "0";
    }
    const cut = r.top + r.height * p;
    el.querySelectorAll<HTMLElement>("[data-step]").forEach((dot) => {
      dot.classList.toggle("is-live", dot.getBoundingClientRect().top + 24 <= cut);
    });
  });
}

/**
 * Нижняя панель «Позвонить / Написать» на телефоне.
 * Появляется после первого экрана, прячется над калькулятором и контактами.
 */
export function ActionBar() {
  const { t } = useLang();
  const [shown, setShown] = useState(false);
  useScrollFrame(() => {
    const y = window.scrollY;
    const hide = ["calculator", "contacts"].some((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return r ? r.top < window.innerHeight && r.bottom > 0 : false;
    });
    setShown(y > window.innerHeight * 0.8 && !hide);
  });
  const c = useContacts();
  return (
    <div className={`action-bar fixed inset-x-3 bottom-3 z-30 md:hidden ${shown ? "is-shown" : ""}`} aria-hidden={!shown}>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-ink/90 p-2 backdrop-blur-md">
        <a href={c.phoneHref} tabIndex={shown ? 0 : -1} className="btn btn-gold !py-3.5">
          <Phone className="h-4 w-4" />
          {t.bar.call}
        </a>
        <a href={c.telegramHref} target="_blank" rel="noopener noreferrer" tabIndex={shown ? 0 : -1} className="btn btn-ghost !py-3.5">
          <Plane className="h-4 w-4" />
          {t.bar.write}
        </a>
      </div>
    </div>
  );
}
