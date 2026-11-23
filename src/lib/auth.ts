import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "oe_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  // сравниваем HMAC-и одинаковой длины — время сравнения не выдаёт пароль
  return safeEqual(sign(`pw:${input}`), sign(`pw:${pass}`));
}

export function createToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: MAX_AGE };
}

export function verifyToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now() / 1000;
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}
