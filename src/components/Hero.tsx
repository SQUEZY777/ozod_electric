"use client";

import { useRef } from "react";
import { useLang } from "@/i18n/LangProvider";
import { useContacts } from "./ContactsContext";
import { LogoShapes } from "./Logo";
import { Arcs, CONTACTS } from "./Arcs";
import { Arrow, Plane } from "./icons";
import { Lines } from "./Lines";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Неоновый знак + контакты, между которыми проскакивают разряды. */
function PowerMark() {
  const mark = useRef<SVGGElement>(null);
  const trigger = useRef<(() => void) | null>(null);
  return (
    <svg
      viewBox="-110 -30 395 345"
      className="h-auto w-full max-w-[230px] cursor-pointer select-none sm:max-w-[300px] xl:max-w-[400px]"
      onPointerEnter={(e) => e.pointerType === "mouse" && trigger.current?.()}
      onClick={() => trigger.current?.()}
      role="img"
      aria-label="OZOD ELECTRIC"
    >
      {/* контакты-клеммы */}
      <g fill="none" stroke="rgba(244,177,38,.45)" strokeWidth="1">
        {CONTACTS.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="5" />
        ))}
      </g>
      <g fill="#F4B126">
        {CONTACTS.map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" />
        ))}
      </g>
      <g ref={mark} className="hero-mark logo-neon">
        <LogoShapes />
      </g>
      <Arcs markRef={mark} triggerRef={trigger} />
    </svg>
  );
}

export function Hero() {
  const { t } = useLang();
  const lines = [t.hero.title1, t.hero.title2, t.hero.title3];
  const tg = useContacts().telegramHref;

  return (
    <section id="top" className="relative isolate overflow-hidden pt-16 lg:pt-[72px]">
      <div className="blueprint pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_75%_35%,black,transparent_65%)]" />
      <Lines className="pointer-events-none absolute -right-40 -top-16 -z-10 hidden w-[820px] max-w-none opacity-25 xl:block" />

      <div className="shell grid grid-cols-1 items-center gap-10 pb-12 pt-10 lg:gap-10 xl:min-h-[calc(100svh-72px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:py-16">
        <div className="hero-in order-last flex justify-center" style={d(200)}>
          <PowerMark />
        </div>

        <div>
          <p className="kicker hero-in" style={d(40)}>
            <span className="mr-2.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-gold align-middle" />
            {t.hero.kicker}
          </p>

          <h1 className="mt-6 font-display font-bold uppercase leading-[1] tracking-[-0.012em] text-bone">
            {lines.map((line, i) => (
              <span key={i} className="line text-[clamp(2.15rem,6.2vw,4.9rem)] xl:text-[clamp(2.6rem,4.4vw,4.6rem)]">
                <span className={i ? "text-gold" : ""} style={d(120 + i * 100)}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-in mt-6 max-w-md text-[15px] leading-relaxed text-mute sm:text-[17px]" style={d(460)}>
            {t.hero.lead}
          </p>

          <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row" style={d(540)}>
            <a href="#calculator" className="btn btn-gold">
              {t.hero.ctaCalc}
              <Arrow />
            </a>
            <a href={tg} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <Plane className="h-4 w-4" />
              {t.hero.ctaWrite}
            </a>
          </div>

          <dl className="hero-in mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.07] pt-6" style={d(620)}>
            {t.hero.facts.map(([n, label]) => (
              <div key={label}>
                <dt className="num font-display text-xl font-bold text-gold sm:text-2xl">{n}</dt>
                <dd className="mt-1 text-[11.5px] leading-snug text-mute sm:text-[12.5px]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
