import { NextResponse } from "next/server";
import { clampInput } from "@/lib/calc";
import { calculate } from "@/lib/calc";
import { addLead, getPrices } from "@/lib/store";
import { formatLead, sendTelegram, telegramEnabled } from "@/lib/telegram";
import { clientIp, sameOrigin } from "@/lib/guard";

export const runtime = "nodejs";

// Простейший rate-limit в памяти процесса: 5 заявок / 10 минут с одного IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 5;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // honeypot: боты заполняют скрытое поле — тихо «принимаем»
  if (str(body.company, 100)) return NextResponse.json({ ok: true });

  const ip = clientIp(req);
  if (limited(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const name = str(body.name, 80);
  const phone = str(body.phone, 24);
  const comment = str(body.comment, 1000);
  const lang = body.lang === "uz" ? "uz" : "ru";
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2 || digits.length < 9 || digits.length > 15) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  // Сумму пересчитываем на сервере по актуальным ценам — клиенту не доверяем.
  const prices = await getPrices();
  const calc = body.calc && typeof body.calc === "object" ? clampInput(body.calc as Record<string, unknown>) : null;
  const total = calc ? calculate(calc, prices).total : null;

  const draft = { name, phone, comment, lang, calc, total };
  let telegram: "sent" | "failed" | "disabled" = "disabled";
  if (telegramEnabled()) telegram = (await sendTelegram(formatLead(draft, prices))) ? "sent" : "failed";

  await addLead({ ...draft, telegram });

  return NextResponse.json({ ok: true, telegram });
}
