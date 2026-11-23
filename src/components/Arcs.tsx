"use client";

import { useEffect, useRef } from "react";

type P = [number, number];

/** Пары «точка на знаке → контакт», между которыми проскакивает разряд. */
const PAIRS: [P, P][] = [
  [[166, 60], [262, 6]],
  [[152, 124], [268, 168]],
  [[72, 240], [-34, 292]],
  [[13, 92], [-92, 52]],
  [[116, 186], [214, 262]],
];
export const CONTACTS: P[] = PAIRS.map((p) => p[1]);

/** Ломаная молнии: рекурсивное смещение середины отрезка. */
function bolt(a: P, b: P, rough = 0.27, depth = 5): P[] {
  let pts: P[] = [a, b];
  let amp = Math.hypot(b[0] - a[0], b[1] - a[1]) * rough;
  for (let d = 0; d < depth; d++) {
    const next: P[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const off = (Math.random() - 0.5) * amp;
      next.push([(x1 + x2) / 2 + (-(y2 - y1) / len) * off, (y1 + y2) / 2 + ((x2 - x1) / len) * off], pts[i + 1]);
    }
    pts = next;
    amp *= 0.55;
  }
  return pts;
}

function toD(pts: P[]) {
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
}

function arcPath(a: P, b: P) {
  const main = bolt(a, b);
  let d = toD(main);
  if (Math.random() < 0.55) {
    // короткое ответвление
    const i = 8 + Math.floor(Math.random() * (main.length - 16));
    const s = main[i];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) * (0.18 + Math.random() * 0.2);
    d += toD(bolt(s, [s[0] + Math.cos(ang) * len, s[1] + Math.sin(ang) * len], 0.3, 4));
  }
  return d;
}

/**
 * Разряды вокруг знака. Перерисовка только во время короткой вспышки (~200 мс),
 * между вспышками — ноль работы. Пауза вне экрана и в фоновой вкладке.
 */
export function Arcs({ markRef, triggerRef }: { markRef: React.RefObject<SVGGElement | null>; triggerRef?: React.RefObject<(() => void) | null> }) {
  const g = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = g.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cores = Array.from(root.querySelectorAll<SVGPathElement>(".arc-core"));
    const glows = Array.from(root.querySelectorAll<SVGPathElement>(".arc-glow"));
    let visible = true;
    let timer = 0;
    const timers: number[] = [];

    const burst = (count = 1 + Math.round(Math.random())) => {
      const picks = [...PAIRS.keys()].sort(() => Math.random() - 0.5).slice(0, count);
      const frames = 3 + Math.floor(Math.random() * 2);
      for (let f = 0; f <= frames; f++) {
        timers.push(
          window.setTimeout(() => {
            const last = f === frames;
            cores.forEach((c, i) => {
              const on = !last && picks.includes(i);
              if (on) {
                const d = arcPath(PAIRS[i][0], PAIRS[i][1]);
                c.setAttribute("d", d);
                glows[i].setAttribute("d", d);
              }
              const o = on ? String(f % 2 ? 0.55 : 1) : "0";
              c.style.opacity = o;
              glows[i].style.opacity = o;
            });
            markRef.current?.classList.toggle("is-dim", !last && f % 2 === 1);
          }, f * 55),
        );
      }
    };

    const loop = () => {
      if (visible && !document.hidden) burst();
      timer = window.setTimeout(loop, 2200 + Math.random() * 2600);
    };
    timer = window.setTimeout(loop, document.documentElement.classList.contains("has-intro") ? 2300 : 900);
    if (triggerRef) triggerRef.current = () => burst(2);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root.ownerSVGElement ?? root);
    return () => {
      window.clearTimeout(timer);
      timers.forEach((t) => window.clearTimeout(t));
      io.disconnect();
    };
  }, [markRef, triggerRef]);

  return (
    <g ref={g} aria-hidden>
      {PAIRS.map((_, i) => (
        <g key={i}>
          <path className="arc arc-glow" />
          <path className="arc arc-core" />
        </g>
      ))}
    </g>
  );
}
