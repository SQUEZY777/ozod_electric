import { calcRanges, type CalcKey, type Prices, type Tariff } from "@/config/site";

export type CalcInput = Record<CalcKey, number> & { tariff: Tariff };

export type CalcLine = { key: CalcKey; qty: number; price: number; sum: number };

export function clampInput(raw: Partial<Record<string, unknown>>): CalcInput {
  const out = {} as CalcInput;
  (Object.keys(calcRanges) as CalcKey[]).forEach((k) => {
    const r = calcRanges[k];
    const n = Math.round(Number(raw[k]));
    out[k] = Number.isFinite(n) ? Math.min(r.max, Math.max(r.min, n)) : r.initial;
  });
  out.tariff = raw.tariff === "pro" ? "pro" : "base";
  return out;
}

export function calculate(input: CalcInput, prices: Prices) {
  const base: Omit<CalcLine, "sum">[] = [
    { key: "points", qty: input.points, price: input.tariff === "pro" ? prices.pointPro : prices.pointBase },
    { key: "lights", qty: input.lights, price: prices.light },
    { key: "cable", qty: input.cable, price: prices.cable },
    { key: "panel", qty: input.panel, price: prices.panel },
  ];
  const lines: CalcLine[] = base.map((l) => ({ ...l, sum: l.qty * l.price }));
  const total = lines.reduce((a, l) => a + l.sum, 0);
  return { lines, total };
}

export const initialInput = (): CalcInput => ({
  points: calcRanges.points.initial,
  lights: calcRanges.lights.initial,
  cable: calcRanges.cable.initial,
  panel: calcRanges.panel.initial,
  tariff: "base",
});
