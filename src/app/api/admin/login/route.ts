import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, createToken, SESSION_COOKIE } from "@/lib/auth";
import { clientIp, isHttps, sameOrigin } from "@/lib/guard";
import { logLogin } from "@/lib/store";

export const runtime = "nodejs";

// защита от перебора: 8 попыток / 15 минут с IP
const tries = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD не задан в .env" }, { status: 503 });
  }
  const ip = clientIp(req);
  const now = Date.now();
  const arr = (tries.get(ip) ?? []).filter((t) => now - t < 15 * 60_000);
  if (arr.length >= 8) return NextResponse.json({ ok: false, error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (typeof password !== "string" || !checkPassword(password)) {
    arr.push(now);
    tries.set(ip, arr);
    await logLogin({ at: new Date().toISOString(), ip, ok: false });
    return NextResponse.json({ ok: false, error: "Неверный пароль" }, { status: 401 });
  }
  tries.delete(ip);
  await logLogin({ at: new Date().toISOString(), ip, ok: true });

  const token = createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "strict",
    secure: isHttps(req),
    path: "/",
    maxAge: token.maxAge,
  });
  return res;
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
