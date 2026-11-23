type MarkProps = { className?: string; neon?: boolean; title?: string; style?: React.CSSProperties };

/**
 * Знак OZOD ELECTRIC — перерисован по брендбуку (координаты сняты с обложки КП):
 * открытая колба с цоколем, три штриха «E», планка и молния.
 * Части помечены классами lm-* для анимаций интро.
 */
export function LogoMark({ className, neon = false, title = "OZOD ELECTRIC", style }: MarkProps) {
  return (
    <svg viewBox="0 0 175 245" className={`${neon ? "logo-neon" : ""} ${className ?? ""}`} role="img" aria-label={title} style={style}>
      <LogoShapes />
    </svg>
  );
}

/** Сами фигуры знака (без <svg>) — для встраивания в сцену с разрядами. */
export function LogoShapes() {
  return (
    <>
      <path
        className="lm-outline"
        pathLength={1}
        d="M143.8 52.1A68.7 68.7 0 1 0 32.4 128.6C42.4 138.6 56 143 56 151V161.7H116.7V151.7L128.3 140"
        fill="none"
        stroke="#FFF4DE"
        strokeWidth="10.5"
        strokeLinejoin="round"
      />
      <g fill="#F4B126">
        <path className="lm-bar lm-b1" d="M91.3 59.3H166.7L154 76H91.3Q87.3 76 87.3 72V63.3Q87.3 59.3 91.3 59.3Z" />
        <path className="lm-bar lm-b2" d="M91.3 88.3H152.7L140.7 104H91.3Q87.3 104 87.3 100V92.3Q87.3 88.3 91.3 88.3Z" />
        <path className="lm-bar lm-b3" d="M91.3 116H153.3L140.7 131.7H91.3Q87.3 131.7 87.3 127.7V120Q87.3 116 91.3 116Z" />
        <rect className="lm-base" x="50" y="174.3" width="67.3" height="13" rx="6.5" />
        <path className="lm-bolt" d="M77.3 188.7H94L85 200L102.7 201.3L71.7 240.7L80 212L66 210.7Z" />
      </g>
    </>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-9 w-auto shrink-0" />
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[15px] font-bold tracking-[0.2em] text-bone">OZOD</span>
        <span className="mt-1 font-display text-[9.5px] font-semibold tracking-[0.46em] text-gold">ELECTRIC</span>
      </span>
    </span>
  );
}
