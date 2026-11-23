"use client";

import { useEffect, useRef } from "react";

/**
 * Лёгкое появление при скролле: один общий IntersectionObserver,
 * анимируются только transform/opacity (GPU), без JS-цикла на кадр.
 */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          observer?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: "div" | "section" | "li" | "article" | "header";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || !io) return;
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={delay ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  accent,
  lead,
  className = "",
}: {
  index: string;
  kicker: string;
  title: string;
  accent: string;
  lead?: string;
  className?: string;
}) {
  return (
    <Reveal as="header" className={`max-w-3xl ${className}`}>
      <p className="kicker">
        <span className="text-gold">{index}</span>
        <span className="mx-2 text-white/20">/</span>
        {kicker}
      </p>
      <h2 className="h-section mt-4">
        {title} <span className="text-gold">{accent}</span>
      </h2>
      {lead ? <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute sm:text-base">{lead}</p> : null}
    </Reveal>
  );
}
