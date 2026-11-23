"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { langs } from "@/i18n/dict";
import { useContacts } from "./ContactsContext";
import { Logo } from "./Logo";
import { Phone } from "./icons";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center rounded-full border border-white/10 p-0.5 font-mono text-[11px] ${className}`} role="group" aria-label="Language">
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-w-9 rounded-full px-2.5 py-1.5 uppercase tracking-[0.12em] transition-colors duration-200 ${
            lang === l ? "bg-bone text-ink" : "text-mute hover:text-bone"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useLang();
  const contacts = useContacts();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const links = [
    ["#services", t.nav.services],
    ["#benefits", t.nav.benefits],
    ["#calculator", t.nav.calc],
    ["#process", t.nav.process],
    ["#guarantee", t.nav.guarantee],
    ["#contacts", t.nav.contacts],
  ] as const;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
          solid || open ? "border-white/[0.07] bg-ink/85 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <a href="#top" aria-label="OZOD ELECTRIC" onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="text-[13px] text-mute transition-colors duration-200 hover:text-bone">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href={contacts.phoneHref} className="num hidden font-mono text-[13px] text-bone transition-colors hover:text-gold lg:block">
              {contacts.phone}
            </a>
            <LangSwitch className="hidden sm:flex" />
            <a href="#calculator" className="btn btn-gold hidden !px-4 !py-2.5 !text-[11px] md:inline-flex">
              {t.nav.cta}
            </a>
            <button
              type="button"
              className="relative grid h-11 w-11 place-items-center xl:hidden"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`absolute h-px w-5 bg-bone transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute h-px w-5 bg-bone transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <div
        className={`fixed inset-0 z-30 bg-ink pt-16 transition-opacity duration-300 xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="shell flex h-full flex-col pb-8 pt-6" aria-label="Mobile">
          {links.map(([href, label], i) => (
            <a
              key={href}
              href={href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-white/[0.07] py-4 font-display text-xl font-semibold uppercase text-bone"
            >
              <span className="num font-mono text-[11px] text-gold">0{i + 1}</span>
              {label}
            </a>
          ))}
          <div className="mt-auto flex items-center justify-between gap-4 pt-8">
            <a href={contacts.phoneHref} tabIndex={open ? 0 : -1} className="num flex items-center gap-2 font-mono text-bone">
              <Phone className="h-4 w-4 text-gold" />
              {contacts.phone}
            </a>
            <LangSwitch />
          </div>
        </nav>
      </div>
    </>
  );
}
