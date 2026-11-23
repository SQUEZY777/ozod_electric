"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { areaRange, calcPresets, calcRanges, objectTypes, type CalcKey, type ObjectType, type Prices } from "@/config/site";
import { useContacts } from "./ContactsContext";
import { calculate, type CalcInput } from "@/lib/calc";
import { money } from "@/lib/format";
import { useLang } from "@/i18n/LangProvider";
import { Reveal, SectionHead } from "./ui";
import { Arrow, Chat } from "./icons";
import { LeadModal } from "./LeadModal";

/** Подбор количеств по типу объекта и площади; значения ограничены диапазонами ползунков. */
function presetInput(type: ObjectType, area: number, tariff: CalcInput["tariff"]): CalcInput {
  const c = calcPresets[type];
  const fit = (k: CalcKey, v: number) => {
    const r = calcRanges[k];
    return Math.min(r.max, Math.max(r.min, Math.round(v / r.step) * r.step));
  };
  return {
    points: fit("points", area * c.points),
    lights: fit("lights", area * c.lights),
    cable: fit("cable", area * c.cable),
    panel: fit("panel", c.panelBase + area * c.panel),
    tariff,
  };
}

const segColor: Record<CalcKey, string> = {
  points: "#E9B04B",
  lights: "#F6D9A0",
  cable: "#9C7226",
  panel: "#EDEAE3",
};

/** Плавный «доезд» итоговой суммы: один rAF-цикл ~350 мс, только при изменении. */
function useTween(target: number, ms = 350) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = a + (target - a) * e;
      from.current = v;
      setVal(v);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return val;
}

function Row({
  index,
  k,
  label,
  hint,
  unit,
  price,
  perUnit,
  sumLabel,
  value,
  onChange,
  children,
}: {
  index: string;
  k: CalcKey;
  label: string;
  hint: string;
  unit: string;
  price: number;
  perUnit: string;
  sumLabel: string;
  value: number;
  onChange: (v: number) => void;
  children?: React.ReactNode;
}) {
  const r = calcRanges[k];
  const p = ((value - r.min) / (r.max - r.min)) * 100;
  const step = (d: number) => onChange(Math.min(r.max, Math.max(r.min, value + d * r.step)));
  return (
    <div className="border-b border-white/[0.07] py-7 first:pt-0 last:border-b-0 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <label htmlFor={`r-${k}`} className="flex items-baseline gap-3 font-display text-base font-semibold uppercase text-bone sm:text-lg">
            <span className="num font-mono text-[11px] font-normal text-gold">{index}</span>
            {label}
          </label>
          <p className="mt-1 pl-7 text-[13px] text-mute">
            {hint} · <span className="num">{money(price)}</span> {sumLabel} {perUnit}
          </p>
        </div>
        <div className="flex items-center gap-1 pl-7 sm:pl-0">
          <button type="button" onClick={() => step(-1)} aria-label="−" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mute transition-colors hover:border-gold/60 hover:text-gold active:scale-95">
            <span className="h-px w-3 bg-current" />
          </button>
          <output htmlFor={`r-${k}`} className="num min-w-[5.5ch] text-right font-mono text-2xl font-bold text-bone sm:text-[28px]">
            {value}
          </output>
          <span className="w-9 font-mono text-[11px] uppercase text-mute">{unit}</span>
          <button type="button" onClick={() => step(1)} aria-label="+" className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mute transition-colors hover:border-gold/60 hover:text-gold active:scale-95">
            <span className="absolute h-px w-3 bg-current" />
            <span className="absolute h-3 w-px bg-current" />
          </button>
        </div>
      </div>
      {children}
      <input
        id={`r-${k}`}
        type="range"
        className="range mt-3"
        min={r.min}
        max={r.max}
        step={r.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--p": `${p}%` } as React.CSSProperties}
      />
      <div className="num flex justify-between font-mono text-[10px] text-mute/70">
        <span>{r.min}</span>
        <span>{r.max}</span>
      </div>
    </div>
  );
}

export function Calculator({ prices }: { prices: Prices }) {
  const { t } = useLang();
  const [input, setInput] = useState<CalcInput>(() => presetInput("flat", areaRange.initial, "base"));
  const [open, setOpen] = useState(false);
  const contacts = useContacts();
  const [auto, setAuto] = useState<{ type: ObjectType; area: number; manual: boolean }>({ type: "flat", area: areaRange.initial, manual: false });

  const applyAuto = (type: ObjectType, area: number) => {
    setAuto({ type, area, manual: false });
    setInput((s) => presetInput(type, area, s.tariff));
  };

  const { lines, total } = useMemo(() => calculate(input, prices), [input, prices]);
  const shown = useTween(total);

  const set = (k: CalcKey) => (v: number) => {
    setInput((s) => ({ ...s, [k]: v }));
    setAuto((a) => (a.manual ? a : { ...a, manual: true }));
  };

  const meta: Record<CalcKey, { label: string; unit: string }> = {
    points: { label: t.calc.points, unit: t.calc.unitPcs },
    lights: { label: t.calc.lights, unit: t.calc.unitPcs },
    cable: { label: t.calc.cable, unit: t.calc.unitM },
    panel: { label: t.calc.panel, unit: t.calc.unitMod },
  };

  // Готовый текст расчёта для WhatsApp (обычные пробелы вместо узких — для любого телефона)
  const plain = (n: number) => money(n).replace(/ /g, " ");
  const waText = [
    t.calc.waIntro,
    `${t.calc.types[auto.type]}, ${auto.area} ${t.calc.unitM2}`,
    ...lines.map((l) => `• ${meta[l.key].label}: ${l.qty} ${meta[l.key].unit} = ${plain(l.sum)} ${t.calc.sum}`),
    `${t.calc.total}: ${plain(total)} ${t.calc.sum}`,
  ].join(String.fromCharCode(10));
  const waHref = `https://wa.me/${contacts.whatsappNumber}?text=${encodeURIComponent(waText)}`;

  return (
    <section id="calculator" className="relative flex min-h-screen items-center bg-coal py-16 sm:py-24">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="shell relative">
        <SectionHead index="04" kicker={t.calc.kicker} title={t.calc.title} accent={t.calc.titleAccent} lead={t.calc.lead} />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="card bg-ink p-5 sm:p-8 lg:col-span-7 xl:col-span-8">
            {/* Автоподбор по типу объекта и площади */}
            <div className="mb-7 rounded-xl border border-gold/20 bg-gold/[0.04] p-4 sm:mb-8 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-bone">{t.calc.auto}</p>
                {auto.manual ? <span className="chip !border-gold/30 !text-gold">{t.calc.manual}</span> : null}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-white/10 p-1" role="radiogroup" aria-label={t.calc.auto}>
                {objectTypes.map((ot) => (
                  <button
                    key={ot}
                    type="button"
                    role="radio"
                    aria-checked={auto.type === ot}
                    onClick={() => applyAuto(ot, auto.area)}
                    className={`rounded-lg px-2 py-2.5 text-[13px] font-medium transition-colors duration-200 ${auto.type === ot ? "bg-gold text-ink" : "text-mute hover:text-bone"}`}
                  >
                    {t.calc.types[ot]}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <label htmlFor="r-area" className="text-[13px] text-mute">{t.calc.area}</label>
                <span className="num font-mono text-lg font-bold text-bone">
                  {auto.area} <span className="text-[11px] font-normal text-mute">{t.calc.unitM2}</span>
                </span>
              </div>
              <input
                id="r-area"
                type="range"
                className="range"
                min={areaRange.min}
                max={areaRange.max}
                step={areaRange.step}
                value={auto.area}
                onChange={(e) => applyAuto(auto.type, Number(e.target.value))}
                style={{ "--p": `${((auto.area - areaRange.min) / (areaRange.max - areaRange.min)) * 100}%` } as React.CSSProperties}
              />
              <p className="text-[12px] leading-relaxed text-mute">{t.calc.autoHint}</p>
            </div>

            <Row index="01" k="points" label={t.calc.points} hint={t.calc.pointsHint} unit={t.calc.unitPcs}
              price={input.tariff === "pro" ? prices.pointPro : prices.pointBase}
              perUnit={t.calc.perUnit} sumLabel={t.calc.sum} value={input.points} onChange={set("points")}>
              <div className="mt-4 inline-grid grid-cols-2 gap-1 rounded-xl border border-white/10 p-1 sm:ml-7" role="radiogroup" aria-label={t.calc.points}>
                {(["base", "pro"] as const).map((tr) => {
                  const active = input.tariff === tr;
                  return (
                    <button
                      key={tr}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setInput((s) => ({ ...s, tariff: tr }))}
                      className={`rounded-lg px-3 py-2 text-left transition-colors duration-200 sm:px-4 ${active ? "bg-gold text-ink" : "text-mute hover:text-bone"}`}
                    >
                      <span className="block font-display text-[11px] font-bold uppercase tracking-[0.1em]">
                        {tr === "base" ? t.calc.tariffBase : t.calc.tariffPro}
                      </span>
                      <span className="num block font-mono text-[12px]">
                        {money(tr === "base" ? prices.pointBase : prices.pointPro)} {t.calc.sum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Row>
            <Row index="02" k="lights" label={t.calc.lights} hint={t.calc.lightsHint} unit={t.calc.unitPcs} price={prices.light}
              perUnit={t.calc.perUnit} sumLabel={t.calc.sum} value={input.lights} onChange={set("lights")} />
            <Row index="03" k="cable" label={t.calc.cable} hint={t.calc.cableHint} unit={t.calc.unitM} price={prices.cable}
              perUnit={t.calc.perUnit} sumLabel={t.calc.sum} value={input.cable} onChange={set("cable")} />
            <Row index="04" k="panel" label={t.calc.panel} hint={t.calc.panelHint} unit={t.calc.unitMod} price={prices.panel}
              perUnit={t.calc.perUnit} sumLabel={t.calc.sum} value={input.panel} onChange={set("panel")} />
          </Reveal>

          {/* Липкий итог для телефона: сумма видна, пока двигаешь ползунки */}
          <div className="sticky bottom-3 z-20 -mt-3 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-ink/95 py-2.5 pl-4 pr-2.5 backdrop-blur">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{t.calc.total}</p>
                <p className="num truncate font-display text-xl font-bold text-gold">
                  {money(shown)} <span className="font-mono text-[11px] font-normal text-mute">{t.calc.sum}</span>
                </p>
              </div>
              <button type="button" onClick={() => setOpen(true)} className="btn btn-gold shrink-0 !px-4 !py-3" aria-label={t.calc.send}>
                <Arrow />
              </button>
            </div>
          </div>

          {/* Смета */}
          <Reveal delay={120} className="lg:col-span-5 xl:col-span-4">
            <div className="card sticky top-24 flex flex-col overflow-hidden bg-ink">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                <span className="kicker">OE · {t.calc.kicker}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </div>
              {/* Структура суммы: 4 сегмента, ширина = доля */}
              <div className="flex h-1.5 gap-[2px] px-5 pt-5 sm:px-6" aria-hidden>
                {lines.map((l) => (
                  <span
                    key={l.key}
                    className="h-full rounded-[1px] transition-[flex-grow] duration-300 ease-out"
                    style={{ flex: `${Math.max(l.sum, 0.0001)} 1 0`, background: segColor[l.key] }}
                  />
                ))}
              </div>
              <ul className="px-5 py-2 sm:px-6">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-baseline justify-between gap-3 border-b border-dashed border-white/[0.07] py-3.5 text-[13px] last:border-b-0">
                    <span className="min-w-0 text-mute">
                      <span className="mr-2 inline-block h-2 w-2 rounded-[1px] align-middle" style={{ background: segColor[l.key] }} />
                      <span className="text-bone">{meta[l.key].label}</span>
                      <span className="num ml-2 font-mono text-[11px]">
                        {l.qty}&nbsp;×&nbsp;{money(l.price)}
                      </span>
                    </span>
                    <span className="num shrink-0 font-mono text-bone">{money(l.sum)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/[0.07] px-5 py-6 sm:px-6">
                <p className="kicker">{t.calc.total}</p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="num font-display text-[clamp(2.1rem,4.6vw,2.9rem)] font-bold leading-none text-gold">{money(shown)}</span>
                  <span className="font-mono text-sm uppercase text-mute">{t.calc.sum}</span>
                </p>
                <p className="mt-4 text-[12px] leading-relaxed text-mute">{t.calc.note}</p>
                <button type="button" onClick={() => setOpen(true)} className="btn btn-gold mt-6 w-full">
                  {t.calc.send}
                  <Arrow />
                </button>
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-2.5 w-full">
                  <Chat className="h-4 w-4" />
                  {t.calc.whatsapp}
                </a>
                <button
                  type="button"
                  onClick={() => applyAuto("flat", areaRange.initial)}
                  className="mt-3 w-full py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute transition-colors hover:text-bone"
                >
                  {t.calc.reset}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <LeadModal open={open} onClose={() => setOpen(false)} calc={input} total={total} />
    </section>
  );
}
