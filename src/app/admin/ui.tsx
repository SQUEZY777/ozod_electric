"use client";

import { useEffect, useState } from "react";

/** Мелкие общие элементы админки. */

export function Toast({ msg, onDone }: { msg: { text: string; ok: boolean } | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const id = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(id);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="modal-in fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 md:bottom-6">
      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-2xl ${msg.ok ? "border-emerald-400/30 bg-[#0d1a14] text-emerald-200" : "border-red-400/30 bg-[#1a0d0d] text-red-200"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${msg.ok ? "bg-emerald-400" : "bg-red-400"}`} />
        {msg.text}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="card p-5">
      <p className="kicker">{label}</p>
      <p className={`num mt-3 font-display text-[28px] font-bold leading-none ${accent ? "text-gold" : "text-bone"}`}>{value}</p>
      {hint ? <p className="mt-2 text-[12px] text-mute">{hint}</p> : null}
    </div>
  );
}

export function Section({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-semibold uppercase tracking-[0.06em] text-bone">{title}</h2>
          {desc ? <p className="mt-1 text-[13px] text-mute">{desc}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  return { msg, show: (text: string, ok = true) => setMsg({ text, ok }), clear: () => setMsg(null) };
}

/** fetch с JSON и понятной ошибкой. */
export async function api(url: string, init?: RequestInit & { json?: unknown }) {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { "Content-Type": "application/json", ...(init?.headers ?? {}) } : init?.headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  }).catch(() => null);
  const data = (await res?.json().catch(() => ({}))) as { ok?: boolean; error?: string } & Record<string, unknown>;
  if (res?.status === 401) window.location.href = "/admin/login";
  return { ok: Boolean(res?.ok), data: data ?? {}, error: data?.error ?? (res ? "Ошибка сохранения" : "Нет соединения") };
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tashkent" });
