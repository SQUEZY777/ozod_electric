"use client";

import { useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { site, guarantees } from "@/config/site";
import { useContacts } from "./ContactsContext";
import { Reveal, SectionHead } from "./ui";
import { Arrow, BoltLine, Chat, Checklist, Helmet, Insta, Layers, Phone, Plane, Shield, Sliders } from "./icons";
import { LogoMark } from "./Logo";
import { LeadModal } from "./LeadModal";
import { useWireProgress } from "./Effects";
import type { Photo } from "./Services";

export function Principles() {
  const { t } = useLang();
  return (
    <section id="principles" className="py-16 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHead index="01" kicker={t.principles.kicker} title={t.principles.title} accent={t.principles.titleAccent} />
        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.principles.items.map((it, i) => (
            <Reveal as="article" key={i} delay={i * 70} className="card group relative overflow-hidden p-6 sm:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                <span className="num">0{i + 1}</span> · {it.tag}
              </p>
              <h3 className="mt-10 font-display text-lg font-semibold uppercase leading-tight text-bone sm:text-xl">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">{it.text}</p>
              <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Benefits() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const icons = [BoltLine, Sliders, Layers, Helmet, Checklist];
  const c = useContacts();
  return (
    <section id="benefits" className="py-16 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHead index="03" kicker={t.benefits.kicker} title={t.benefits.title} accent={t.benefits.titleAccent} className="!max-w-4xl" />
        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <ul className="lg:col-span-7">
            {t.benefits.items.map((it, i) => {
              const Icon = icons[i];
              return (
                <Reveal as="li" key={i} delay={i * 60} className="group flex items-start gap-5 border-b border-white/[0.07] py-5 first:pt-0 last:border-b-0 sm:gap-6 sm:py-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/[0.06] text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-ink">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-display text-[15px] font-semibold leading-snug text-bone sm:text-[17px]">{it.title}</h3>
                    <p className="mt-1 text-sm text-mute">{it.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
          <div className="lg:col-span-5">
            <Reveal className="card p-6 sm:p-7 lg:sticky lg:top-28">
              <p className="font-display text-lg font-semibold leading-snug text-bone">{t.benefits.ctaTitle}</p>
              <p className="mt-2 text-sm text-mute">{t.benefits.ctaText}</p>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a href={c.telegramHref} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                  <Plane className="h-4 w-4" /> Telegram
                </a>
                <a href={c.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Chat className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full py-2 text-[13px] text-mute underline-offset-4 transition-colors hover:text-bone hover:underline">
                {t.contacts.leave}
              </button>
            </Reveal>
          </div>
        </div>
      </div>
      <LeadModal open={open} onClose={() => setOpen(false)} calc={null} total={null} />
    </section>
  );
}

export function Process() {
  const { t } = useLang();
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const spark = useRef<HTMLSpanElement>(null);
  useWireProgress(list, fill, spark);
  return (
    <section id="process" className="py-16 sm:py-24 lg:py-32">
      <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHead index="05" kicker={t.process.kicker} title={t.process.title} accent={t.process.titleAccent} lead={t.process.lead} />
          </div>
        </div>
        <ol ref={list} className="relative lg:col-span-7 lg:col-start-6">
          <span className="absolute bottom-7 left-[23px] top-7 w-px bg-white/10 sm:left-[27px]" aria-hidden>
            <span ref={fill} className="absolute inset-0 origin-top bg-gradient-to-b from-gold/40 to-gold" style={{ transform: "scaleY(0)" }} />
            <span ref={spark} className="spark" style={{ opacity: 0 }} />
          </span>
          {t.process.steps.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 60} className="relative flex gap-6 pb-11 last:pb-0 sm:gap-8">
              <span data-step className="step-dot num relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-ink font-mono text-sm font-bold text-mute sm:h-14 sm:w-14 sm:text-base">
                0{i + 1}
              </span>
              <div className="pt-2.5 sm:pt-3.5">
                <h3 className="font-display text-lg font-semibold uppercase text-bone sm:text-xl">{s.title}</h3>
                <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-mute">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Guarantee() {
  const { t } = useLang();
  const unit = (y: number) => (y === 5 ? t.guarantee.years : y === 3 ? t.guarantee.years3 : t.guarantee.years2);
  return (
    <section id="guarantee" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="shell relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead index="06" kicker={t.guarantee.kicker} title={t.guarantee.title} accent={t.guarantee.titleAccent} lead={t.guarantee.lead} />
          <Reveal className="flex items-center gap-4 rounded-2xl border border-gold/30 bg-gold/[0.05] px-5 py-4">
            <Shield className="h-8 w-8 text-gold" />
            <span className="font-display text-[13px] font-semibold uppercase leading-tight text-bone">
              OZOD ELECTRIC
              <br />
              <span className="text-gold">{t.guarantee.kicker}</span>
            </span>
          </Reveal>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-3 md:grid-cols-3">
          {guarantees.map((g, i) => (
            <Reveal as="article" key={g.key} delay={i * 80} className="card relative overflow-hidden p-7 sm:p-8">
              <div className="flex items-baseline gap-2.5">
                <span className="num font-display text-[clamp(4rem,8vw,6rem)] font-bold leading-[0.85] text-gold">{g.years}</span>
                <span className="font-display text-lg font-semibold uppercase text-bone">{unit(g.years)}</span>
              </div>
              <div className="mt-7 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="g-bar h-full origin-left rounded-full bg-gold" style={{ width: `${(g.years / 5) * 100}%`, transitionDelay: `${300 + i * 120}ms` }} />
              </div>
              <p className="mt-5 text-[15px] font-medium leading-snug text-bone">{t.guarantee[g.key]}</p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-mute">{t.guarantee.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function Portfolio({ photos }: { photos: Photo[] }) {
  const { t } = useLang();
  if (photos.length < 5) return null;
  return (
    <section id="portfolio" className="py-16 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHead index="07" kicker={t.portfolio.kicker} title={t.portfolio.title} accent={t.portfolio.titleAccent} />
        <div className="mt-12 columns-2 gap-2 sm:gap-3 lg:columns-3">
          {photos.slice(0, 24).map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 60} className="mb-2 break-inside-avoid sm:mb-3">
              <figure className="frame relative overflow-hidden rounded-xl bg-graphite">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption || t.portfolio.kicker} loading="lazy" decoding="async" className="frame-img w-full" />
                {p.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 text-[12px] text-bone/90">{p.caption}</figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contacts() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const c = useContacts();
  const channels = [
    { href: c.telegramHref, label: "Telegram", value: c.telegram, Icon: Plane },
    { href: c.instagramHref, label: "Instagram", value: c.instagram, Icon: Insta },
    { href: c.whatsapp, label: "WhatsApp", value: c.phone, Icon: Chat },
  ];
  return (
    <section id="contacts" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="shell">
        <Reveal className="card relative overflow-hidden p-6 sm:p-10 lg:p-14">
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="kicker">
                <span className="text-gold">08</span> <span className="text-white/20">/</span> {t.contacts.kicker}
              </p>
              <h2 className="h-section mt-4">
                {t.contacts.title} <span className="text-gold">{t.contacts.titleAccent}</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] text-mute">{t.contacts.lead}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setOpen(true)} className="btn btn-gold">
                  {t.contacts.leave}
                  <Arrow />
                </button>
                <a href="#calculator" className="btn btn-ghost">
                  {t.nav.calc}
                </a>
              </div>
              <p className="mt-10 max-w-md border-l-2 border-gold pl-4 text-sm leading-relaxed text-bone/90">{t.contacts.slogan}</p>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <a href={c.phoneHref} className="group block rounded-xl border border-white/[0.08] bg-ink/60 p-5 transition-colors duration-300 hover:border-gold/50 sm:p-6">
                <p className="kicker flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" /> {t.contacts.phone}
                </p>
                <p className="num mt-3 font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-bold text-bone transition-colors group-hover:text-gold">{c.phone}</p>
              </a>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {channels.map(({ href, label, value, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-ink/60 p-4 transition-colors duration-300 hover:border-gold/50 sm:flex-col sm:items-start"
                  >
                    <Icon className="h-5 w-5 text-gold" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-bone">{label}</span>
                      <span className="num block truncate font-mono text-[11px] text-mute">{value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <LeadModal open={open} onClose={() => setOpen(false)} calc={null} total={null} />
    </section>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/[0.07] pb-24 md:pb-0">
      <div className="shell flex flex-col gap-5 py-9 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <LogoMark className="h-10 w-auto" />
          <div>
            <p className="font-display text-sm font-bold tracking-[0.16em] text-bone">{site.brand}</p>
            <p className="text-[12px] text-mute">{t.footer.line}</p>
          </div>
        </div>
        <p className="num font-mono text-[11px] text-mute">
          © {site.year} {site.brand} · {site.city}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
