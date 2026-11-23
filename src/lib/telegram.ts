import "server-only";
import type { Lead } from "./store";
import { money } from "./format";
import { calculate } from "./calc";
import type { Prices } from "@/config/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const labels = {
  points: ["Черновые точки", "шт"],
  lights: ["Светильники", "шт"],
  cable: ["Прокладка кабеля", "м"],
  panel: ["Сборка щита", "мод."],
} as const;

export function telegramEnabled() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export function formatLead(lead: Omit<Lead, "id" | "createdAt" | "telegram" | "status" | "note">, prices: Prices) {
  const rows: string[] = [
    "<b>Новая заявка — OZOD ELECTRIC</b>",
    "",
    `<b>Имя:</b> ${esc(lead.name)}`,
    `<b>Телефон:</b> ${esc(lead.phone)}`,
  ];
  if (lead.comment) rows.push(`<b>Комментарий:</b> ${esc(lead.comment)}`);
  if (lead.calc) {
    const { lines, total } = calculate(lead.calc, prices);
    rows.push("", "<b>Расчёт с калькулятора</b>");
    rows.push(`Тариф точек: ${lead.calc.tariff === "pro" ? "бетон / монолит" : "стандарт"}`);
    for (const l of lines) {
      const [name, unit] = labels[l.key];
      rows.push(`• ${name}: ${l.qty} ${unit} × ${money(l.price)} = <b>${money(l.sum)}</b> сум`);
    }
    rows.push("", `<b>ИТОГО: ${money(total)} сум</b>`);
  }
  rows.push("", `Язык сайта: ${lead.lang.toUpperCase()}`);
  return rows.join("\n");
}

export async function sendTelegram(text: string): Promise<boolean> {
  if (!telegramEnabled()) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) console.error("[telegram]", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[telegram]", e);
    return false;
  }
}
