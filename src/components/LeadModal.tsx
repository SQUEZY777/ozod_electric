"use client";

import { useEffect, useRef, useState } from "react";
import type { CalcInput } from "@/lib/calc";
import { money } from "@/lib/format";
import { useContacts } from "./ContactsContext";
import { useLang } from "@/i18n/LangProvider";
import { Arrow, Close, Plane } from "./icons";

/** +998 99 821 11 20 — маска для узбекских номеров, иные номера не ломаем. */
function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (!d.startsWith("998")) return raw.startsWith("+") ? "+" + d : d ? "+" + d : "";
  d = d.slice(0, 12);
  const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return "+" + p.join(" ");
}

type State = "idle" | "sending" | "ok" | "error" | "invalid";

export function LeadModal({
  open,
  onClose,
  calc,
  total,
}: {
  open: boolean;
  onClose: () => void;
  calc: CalcInput | null;
  total: number | null;
}) {
  const { t, lang } = useLang();
  const contacts = useContacts();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<State>("idle");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => first.current?.focus(), 60);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(id);
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && state !== "sending") setState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2 || digits.length < 9 || digits.length > 15) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const hp = (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, comment, lang, calc, company: hp }),
      });
      setState(res.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <button type="button" aria-label={t.form.close} className="fade-in absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="modal-in relative max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-coal sm:rounded-2xl">
        
        <div className="flex items-start justify-between gap-4 p-6 pb-0 sm:p-8 sm:pb-0">
          <div>
            <p className="kicker">OZOD ELECTRIC</p>
            <h3 id="lead-title" className="mt-3 font-display text-2xl font-bold uppercase text-bone">
              {calc ? t.form.title : t.form.titlePlain}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label={t.form.close} className="-mr-2 -mt-1 grid h-11 w-11 place-items-center text-mute transition-colors hover:text-bone">
            <Close />
          </button>
        </div>

        {state === "ok" ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-gold/40 bg-gold/[0.06] p-5 text-[15px] leading-relaxed text-bone">{t.form.success}</div>
            <button type="button" onClick={onClose} className="btn btn-ghost mt-6 w-full">
              {t.form.close}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6 sm:p-8" noValidate>
            <p className="text-sm leading-relaxed text-mute">{t.form.lead}</p>
            {calc && total !== null ? (
              <div className="flex items-baseline justify-between gap-3 rounded-xl border border-white/10 bg-ink px-4 py-3">
                <span className="text-[12px] text-mute">{t.form.attached}</span>
                <span className="num font-mono text-lg font-bold text-gold">
                  {money(total)} <span className="text-[11px] text-mute">{t.calc.sum}</span>
                </span>
              </div>
            ) : null}
            <label className="block">
              <span className="kicker mb-2 block">{t.form.name}</span>
              <input ref={first} className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required />
            </label>
            <label className="block">
              <span className="kicker mb-2 block">{t.form.phone}</span>
              <input
                className="field num font-mono"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                required
              />
            </label>
            <label className="block">
              <span className="kicker mb-2 block">{t.form.comment}</span>
              <textarea
                className="field min-h-[88px] resize-y"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.form.commentPh}
                maxLength={1000}
              />
            </label>
            {/* ловушка для ботов */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />

            {state === "invalid" && <p className="text-sm text-gold">{t.form.invalid}</p>}
            {state === "error" && (
              <p className="text-sm text-gold">
                {t.form.error}{" "}
                <a className="underline underline-offset-4" href={contacts.phoneHref}>
                  {contacts.phone}
                </a>
              </p>
            )}

            <button type="submit" disabled={state === "sending"} className="btn btn-gold w-full disabled:opacity-60">
              {state === "sending" ? t.form.sending : t.form.submit}
              {state === "sending" ? <Plane className="h-4 w-4" /> : <Arrow />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
