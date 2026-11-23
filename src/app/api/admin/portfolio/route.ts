import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/guard";
import { addPortfolio, removePortfolio, reorderPortfolio, updatePortfolio, UPLOAD_DIR } from "@/lib/store";
import { categories, type Category } from "@/config/site";

export const runtime = "nodejs";

const MAX = 10 * 1024 * 1024;

/** Тип определяем по сигнатуре файла, а не по расширению/заголовку от клиента. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  const ascii = (s: number, e: number) => String.fromCharCode(...b.slice(s, e));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && /avif|avis/.test(ascii(8, 12))) return "avif";
  return null;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "Нет данных" }, { status: 400 });

  const category = String(form.get("category") ?? "") as Category;
  if (!categories.includes(category)) return NextResponse.json({ ok: false, error: "Неверная категория" }, { status: 422 });
  const caption = String(form.get("caption") ?? "").trim().slice(0, 120);

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ ok: false, error: "Выберите фото" }, { status: 422 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const added = [];
  for (const f of files.slice(0, 20)) {
    if (f.size > MAX) return NextResponse.json({ ok: false, error: `${f.name}: больше 10 МБ` }, { status: 413 });
    const buf = new Uint8Array(await f.arrayBuffer());
    const ext = sniff(buf);
    if (!ext) return NextResponse.json({ ok: false, error: `${f.name}: нужен JPG, PNG, WEBP или AVIF` }, { status: 415 });
    const file = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, file), buf);
    added.push(await addPortfolio({ file, category, caption }));
  }
  return NextResponse.json({ ok: true, added });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const removed = await removePortfolio(id);
  if (removed) await fs.unlink(path.join(UPLOAD_DIR, removed.file)).catch(() => undefined);
  return NextResponse.json({ ok: Boolean(removed) });
}

/** Правка подписи/направления фото или новый порядок: { id, caption?, category? } | { order: string[] } */
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; caption?: unknown; category?: unknown; order?: unknown };
  if (Array.isArray(b.order)) {
    await reorderPortfolio(b.order.filter((x): x is string => typeof x === "string").slice(0, 1000));
    return NextResponse.json({ ok: true });
  }
  if (typeof b.id !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const patch: { caption?: string; category?: Category } = {};
  if (b.caption !== undefined) patch.caption = String(b.caption).trim().slice(0, 120);
  if (b.category !== undefined) {
    if (!categories.includes(b.category as Category)) return NextResponse.json({ ok: false }, { status: 422 });
    patch.category = b.category as Category;
  }
  const ok = await updatePortfolio(b.id, patch);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
