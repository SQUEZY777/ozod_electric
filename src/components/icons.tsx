/** Собственный минимальный набор линейных иконок, штрих 1.5px. */
type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const Arrow = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={`arrow ${className}`}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const Phone = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.6 16.6 0 0 1 3.4 5.2 1.6 1.6 0 0 1 5 3.5Z" />
  </svg>
);

export const Plane = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M21 3.5 2.8 10.6l6.6 2.3 2.3 6.6L21 3.5ZM9.4 12.9 21 3.5" />
  </svg>
);

export const Insta = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="M17.2 6.8h.01" strokeWidth="2.2" />
  </svg>
);

export const Chat = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6l-3.9.9Z" />
    <path d="M9.3 9.2c.2 1.9 3.1 4.9 5.5 5.5l1-1.2-1.6-.9-.7.7c-.9-.4-1.9-1.4-2.3-2.3l.7-.7-.9-1.6-1.7.5Z" />
  </svg>
);

export const Shield = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3 4.5 6v5.6c0 4.5 3.1 8.2 7.5 9.4 4.4-1.2 7.5-4.9 7.5-9.4V6L12 3Z" />
    <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
  </svg>
);

export const Close = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Bolt = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M13.5 2 5 13.5h6L9.5 22 19 9.8h-6.2L13.5 2Z" />
  </svg>
);

export const BoltLine = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M13.5 2.5 5.5 13.5h5.8l-1.3 8 8.5-11.4h-5.9l.9-7.6Z" />
  </svg>
);

export const Sliders = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M5 4v16M12 4v16M19 4v16" />
    <rect x="3" y="13" width="4" height="3.2" rx="1" />
    <rect x="10" y="7" width="4" height="3.2" rx="1" />
    <rect x="17" y="11" width="4" height="3.2" rx="1" />
  </svg>
);

export const Layers = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="m12 3.5 9 4.5-9 4.5L3 8l9-4.5Z" />
    <path d="m3 12 9 4.5 9-4.5M3 16l9 4.5 9-4.5" />
  </svg>
);

export const Helmet = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M4 17v-2.5a8 8 0 0 1 16 0V17" />
    <path d="M2.8 17h18.4v2.5H2.8z" />
    <path d="M10 6.8V11M14 6.8V11" />
  </svg>
);

export const Checklist = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3h6v2.5H9z" />
    <path d="m8.5 12 1.8 1.8 3.5-3.6M8.5 17h7" />
  </svg>
);
