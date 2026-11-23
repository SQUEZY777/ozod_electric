import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/guard";
import { getLeads, leadStatuses, removeLead, updateLead, type LeadStatus } from "@/lib/store";

export const runtime = "nodejs";

const statusRu: Record<LeadStatus, string> = { new: "Новая", work: "В работе", done: "Выполнена", lost: "Отказ" };

/** CSV для Excel: разделитель «;», BOM для кириллицы, защита от формул в ячейках. */
function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  if (new URL(req.url).searchParams.get("format") !== "csv") return NextResponse.json({ ok: false }, { status: 400 });
  const leads = await getLeads();
  const head = ["Дата", "Имя", "Телефон", "Статус", "Сумма, сум", "Точки", "Тариф", "Светильники", "Кабель, м", "Щит, мод.", "Комментарий", "Заметка", "Язык"];
  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" }),
    l.name,
    l.phone,
    statusRu[l.status],
    l.total ?? "",
    l.calc?.points ?? "",
    l.calc ? (l.calc.tariff === "pro" ? "бетон" : "стандарт") : "",
    l.calc?.lights ?? "",
    l.calc?.cable ?? "",
    l.calc?.panel ?? "",
    l.comment,
    l.note,
    l.lang,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ozod-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: unknown; status?: unknown; note?: unknown };
  if (typeof body.id !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const patch: { status?: LeadStatus; note?: string } = {};
  if (body.status !== undefined) {
    if (!leadStatuses.includes(body.status as LeadStatus)) return NextResponse.json({ ok: false }, { status: 422 });
    patch.status = body.status as LeadStatus;
  }
  if (body.note !== undefined) patch.note = String(body.note).slice(0, 2000);
  const ok = await updateLead(body.id, patch);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await removeLead(id);
  return NextResponse.json({ ok: true });
}
