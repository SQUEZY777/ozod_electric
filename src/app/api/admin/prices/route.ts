import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/guard";
import { setPrices } from "@/lib/store";
import { defaultPrices, type Prices } from "@/config/site";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const next = {} as Prices;
  for (const k of Object.keys(defaultPrices) as (keyof Prices)[]) {
    const n = Math.round(Number(body[k]));
    if (!Number.isFinite(n) || n < 1 || n > 100_000_000) {
      return NextResponse.json({ ok: false, error: `Некорректное значение: ${k}` }, { status: 422 });
    }
    next[k] = n;
  }
  await setPrices(next);
  return NextResponse.json({ ok: true, prices: next });
}
