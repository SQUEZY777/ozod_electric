import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/guard";
import { setContacts } from "@/lib/store";
import { sendTelegram, telegramEnabled } from "@/lib/telegram";

export const runtime = "nodejs";

const clean = (v: unknown, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Сохранение контактов сайта. */
export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const phone = clean(b.phone, 24);
  const whatsapp = clean(b.whatsapp, 24);
  const telegram = clean(b.telegram).replace(/^@/, "");
  const instagram = clean(b.instagram).replace(/^@/, "");

  const digits = (s: string) => s.replace(/\D/g, "").length;
  if (digits(phone) < 9 || digits(phone) > 15) return NextResponse.json({ ok: false, error: "Проверьте номер телефона" }, { status: 422 });
  if (whatsapp && (digits(whatsapp) < 9 || digits(whatsapp) > 15)) return NextResponse.json({ ok: false, error: "Проверьте номер WhatsApp" }, { status: 422 });
  if (!/^[A-Za-z0-9_]{5,32}$/.test(telegram)) return NextResponse.json({ ok: false, error: "Ник Telegram: 5–32 символа, латиница, цифры и _" }, { status: 422 });
  if (!/^[A-Za-z0-9._]{1,30}$/.test(instagram)) return NextResponse.json({ ok: false, error: "Ник Instagram: латиница, цифры, точка и _" }, { status: 422 });

  await setContacts({ phone, whatsapp: whatsapp || phone, telegram, instagram });
  return NextResponse.json({ ok: true });
}

/** Тестовое сообщение в Telegram — проверить, что бот настроен. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!telegramEnabled()) return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID не заданы в .env.local" }, { status: 503 });
  const ok = await sendTelegram("<b>OZOD ELECTRIC</b>\nТестовое сообщение из админ-панели. Заявки будут приходить сюда.");
  return NextResponse.json(ok ? { ok } : { ok, error: "Telegram не принял сообщение — проверьте токен и chat id" }, { status: ok ? 200 : 502 });
}
