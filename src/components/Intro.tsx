"use client";

import { useEffect, useRef } from "react";
import { LogoShapes } from "./Logo";

const OUTLINE = "M143.8 52.1A68.7 68.7 0 1 0 32.4 128.6C42.4 138.6 56 143 56 151V161.7H116.7V151.7L128.3 140";

/**
 * Интро при первом входе за сессию (~1.9 c), сдержанно и без «эффектов ради эффектов»:
 * искра прорисовывает колбу → штрихи «E» загораются → молния → тонкая линия под названием →
 * экран мягко растворяется. Без фильтров и масштабирования — только opacity/transform
 * и обводка небольшого SVG, поэтому не подтормаживает и на слабых телефонах.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const skip = () => el.classList.add("intro-skip");
    // если анимации заморожены (фоновая вкладка, энергосбережение) — убираем экран сами
    const failsafe = window.setTimeout(() => (el.style.display = "none"), 3200);
    const opts = { once: true, passive: true } as const;
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);
    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
  }, []);

  return (
    <div ref={ref} className="intro" aria-hidden onClick={() => ref.current?.classList.add("intro-skip")}>
      <div className="intro-bg" />
      <div className="intro-stage">
        <svg viewBox="0 0 175 245" className="intro-mark h-32 w-auto sm:h-40">
          <LogoShapes />
          <path className="intro-spark-glow" d={OUTLINE} pathLength={1} />
          <path className="intro-spark" d={OUTLINE} pathLength={1} />
        </svg>
        <p className="intro-word mt-9 font-display text-[13px] font-semibold tracking-[0.5em] text-bone sm:text-[15px]">
          OZOD <span className="text-gold">ELECTRIC</span>
        </p>
        <span className="intro-line mt-4 block h-px w-28 bg-gold" />
      </div>
    </div>
  );
}

/** Выполняется до первой отрисовки: не показывать интро повторно и при reduced-motion. */
export const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem('oe-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('no-intro')}else{sessionStorage.setItem('oe-intro','1');d.classList.add('has-intro')}}catch(e){document.documentElement.classList.add('no-intro')}`;
