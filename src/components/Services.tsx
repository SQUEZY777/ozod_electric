"use client";

import { useCallback, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { defaultPhotos, photoLayouts, type Category, type LayoutItem, type PhotoId } from "@/config/site";
import { Reveal, SectionHead } from "./ui";
import { Lightbox, type LightItem } from "./Lightbox";

export type Photo = { id: string; src: string; caption: string; category: Category };

const ratio = (id: PhotoId) => defaultPhotos[id].w / defaultPhotos[id].h;
const itemRatio = (it: LayoutItem) => (Array.isArray(it) ? 1 / it.reduce((a, id) => a + 1 / ratio(id), 0) : ratio(it));
const GAP = "gap-2 sm:gap-2.5";

/** Ширина мозаики подобрана так, чтобы на компьютере она целиком помещалась в экран. */
const galleryMax: Record<Category, number> = { panels: 560, rough: 600, lowcurrent: 600, lighting: 640 };

function Shot({ src, alt, caption, onOpen, style, className = "", eager }: { src: string; alt: string; caption?: string; onOpen: () => void; style?: React.CSSProperties; className?: string; eager?: boolean }) {
  return (
    <button type="button" onClick={onOpen} aria-label={alt} style={style} className={`frame group relative block min-h-0 min-w-0 overflow-hidden rounded-xl bg-graphite text-left ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className="frame-img h-full w-full object-cover" />
      {caption ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-9 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-bone sm:px-3.5 sm:text-[11px]">
          {caption}
        </span>
      ) : null}
      <span className="pointer-events-none absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
        </svg>
      </span>
    </button>
  );
}

/** Мозаика как на странице КП: строки с точными пропорциями кадров — ничего не обрезается. */
function Mosaic({ cat, alt, captions, eager, open }: { cat: Category; alt: string; captions: Record<string, string>; eager: boolean; open: (items: LightItem[], i: number) => void }) {
  const list: LightItem[] = [];
  const index = new Map<PhotoId, number>();
  for (const row of photoLayouts[cat])
    for (const it of row)
      for (const id of Array.isArray(it) ? it : [it]) {
        index.set(id, list.length);
        list.push({ src: `/portfolio/${id}.webp`, alt: captions[id] ?? alt, caption: captions[id], w: defaultPhotos[id].w });
      }
  const shot = (id: PhotoId, flex: number) => (
    <Shot key={id} src={`/portfolio/${id}.webp`} alt={captions[id] ?? alt} caption={captions[id]} eager={eager} style={{ flex: `${flex} 1 0` }} onOpen={() => open(list, index.get(id)!)} />
  );
  return (
    <div className={`flex flex-col ${GAP}`}>
      {photoLayouts[cat].map((row, ri) => (
        <div key={ri} className={`flex ${GAP}`} style={{ aspectRatio: String(row.reduce((a, it) => a + itemRatio(it), 0)) }}>
          {row.map((it, ii) =>
            Array.isArray(it) ? (
              <div key={ii} className={`flex min-w-0 flex-col ${GAP}`} style={{ flex: `${itemRatio(it)} 1 0` }}>
                {it.map((id) => shot(id, 1 / ratio(id)))}
              </div>
            ) : (
              shot(it, ratio(it))
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** Фото из админки (пропорции заранее неизвестны) — аккуратная сетка. */
function Uploaded({ photos, alt, open }: { photos: Photo[]; alt: string; open: (items: LightItem[], i: number) => void }) {
  const list = photos.map((p) => ({ src: p.src, alt: p.caption || alt, caption: p.caption }));
  const [first, ...rest] = photos.slice(0, 5);
  return (
    <div className={`grid grid-cols-2 ${GAP} sm:grid-cols-3`}>
      <Shot src={first.src} alt={first.caption || alt} caption={first.caption} onOpen={() => open(list, 0)} className="col-span-2 row-span-2 aspect-square sm:aspect-auto" />
      {rest.map((p, i) => (
        <Shot key={p.id} src={p.src} alt={p.caption || alt} caption={p.caption} onOpen={() => open(list, i + 1)} className="aspect-[4/3]" />
      ))}
    </div>
  );
}

export function Services({ photos }: { photos: Photo[] }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<{ items: LightItem[]; index: number } | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const open = useCallback((items: LightItem[], index: number) => setLightbox({ items, index }), []);
  const close = useCallback(() => setLightbox(null), []);

  const select = (i: number) => {
    setActive(i);
    const bar = tabs.current;
    const btn = bar?.children[i] as HTMLElement | undefined;
    if (bar && btn) bar.scrollTo({ left: btn.offsetLeft - (bar.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
  };
  const onKey = (e: React.KeyboardEvent) => {
    const n = t.services.items.length;
    if (e.key === "ArrowRight") select((active + 1) % n);
    if (e.key === "ArrowLeft") select((active - 1 + n) % n);
  };

  return (
    <section id="services" className="py-16 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHead index="02" kicker={t.services.kicker} title={t.services.title} accent={t.services.titleAccent} lead={t.services.lead} />

        <Reveal className="mt-8 sm:mt-10">
          <div
            ref={tabs}
            role="tablist"
            aria-label={t.services.kicker}
            onKeyDown={onKey}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {t.services.items.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                id={`tab-${s.id}`}
                aria-selected={active === i}
                aria-controls={`panel-${s.id}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => select(i)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] transition-colors duration-300 ${
                  active === i ? "border-gold bg-gold text-ink" : "border-white/10 text-mute hover:border-white/25 hover:text-bone"
                }`}
              >
                <span className="num font-mono text-[10.5px] opacity-70">0{i + 1}</span>
                <span className="font-medium">{s.tab}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-8 sm:mt-10">
          <div className="relative">
            {t.services.items.map((s, i) => {
              const cat = s.id as Category;
              const own = photos.filter((p) => p.category === cat);
              return (
                <div key={s.id} id={`panel-${s.id}`} role="tabpanel" aria-labelledby={`tab-${s.id}`} aria-hidden={active !== i} className={`tab-panel ${active === i ? "is-active" : ""}`}>
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-4 lg:pt-1">
                      <p className="kicker">
                        <span className="num text-gold">0{i + 1}</span> <span className="text-white/20">/</span> {s.tab}
                      </p>
                      <h3 className="mt-4 font-display text-[clamp(1.7rem,3vw,2.5rem)] font-bold uppercase leading-[1.04] text-bone [overflow-wrap:anywhere]">
                        {s.titleA}
                        {s.joined ? "" : " "}
                        <span className="text-gold">{s.titleB}</span>
                      </h3>
                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {s.tags.map((tag) => (
                          <li key={tag} className="chip">
                            {tag}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-7 border-l-2 border-gold pl-4">
                        <p className="font-display text-[14px] font-semibold uppercase leading-snug text-bone sm:text-[15px]">{s.statement}</p>
                        {s.note ? <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.note}</p> : null}
                      </div>
                    </div>
                    <div className="lg:col-span-8">
                      <div className="lg:ml-auto" style={{ maxWidth: own.length ? 720 : galleryMax[cat] }}>
                        {own.length ? <Uploaded photos={own} alt={s.tab} open={open} /> : <Mosaic cat={cat} alt={s.tab} captions={t.services.captions} eager={i === 0} open={open} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
      <Lightbox items={lightbox?.items ?? []} index={lightbox?.index ?? null} onClose={close} />
    </section>
  );
}
