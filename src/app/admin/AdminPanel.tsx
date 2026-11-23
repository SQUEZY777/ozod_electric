"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { areaRange, calcPresets, categories, defaultPrices, type Category, type Prices } from "@/config/site";
import type { Contacts, Lead, LeadStatus, LoginEntry, PortfolioItem } from "@/lib/store";
import { money } from "@/lib/format";
import { calculate } from "@/lib/calc";
import { LogoMark } from "@/components/Logo";
import { Close } from "@/components/icons";
import { Section, Stat, Toast, api, fmtDate, useToast } from "./ui";

type Security = { telegram: boolean; secret: boolean; strongPassword: boolean };
type Tab = "home" | "leads" | "prices" | "portfolio" | "settings";

const statusMeta: Record<LeadStatus, { label: string; cls: string; bar: string }> = {
  new: { label: "Новая", cls: "bg-gold/15 text-gold ring-1 ring-inset ring-gold/30", bar: "bg-gold" },
  work: { label: "В работе", cls: "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/30", bar: "bg-sky-400" },
  done: { label: "Выполнена", cls: "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30", bar: "bg-emerald-400" },
  lost: { label: "Отказ", cls: "bg-white/[0.06] text-mute ring-1 ring-inset ring-white/10", bar: "bg-white/25" },
};
const statusOrder: LeadStatus[] = ["new", "work", "done", "lost"];

const catLabel: Record<Category, string> = { panels: "Электрощиты", rough: "Черновой монтаж", lowcurrent: "Слаботочка", lighting: "Освещение" };

const tabsMeta: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Обзор", icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" },
  { id: "leads", label: "Заявки", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "prices", label: "Цены", icon: "M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" },
  { id: "portfolio", label: "Фото", icon: "M4 6h16v12H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17" },
  { id: "settings", label: "Настройки", icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 2.5h4l.4-2.5c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6Z" },
];

export function AdminPanel(props: {
  prices: Prices;
  portfolio: PortfolioItem[];
  leads: Lead[];
  contacts: Contacts;
  logins: LoginEntry[];
  security: Security;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [leads, setLeads] = useState(props.leads);
  const toast = useToast();

  useEffect(() => setLeads(props.leads), [props.leads]);

  const newCount = leads.filter((l) => l.status === "new").length;
  const refresh = () => router.refresh();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-svh pb-24 md:pb-0 md:pl-60">
      {/* Боковое меню (десктоп) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[0.07] bg-coal md:flex">
        <a href="/" className="flex items-center gap-3 px-6 py-6" title="Открыть сайт">
          <LogoMark className="h-9 w-auto" />
          <span className="leading-tight">
            <span className="block font-display text-[13px] font-bold tracking-[0.16em] text-bone">OZOD</span>
            <span className="block text-[11px] text-mute">админ-панель</span>
          </span>
        </a>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {tabsMeta.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${tab === t.id ? "bg-white/[0.07] text-bone" : "text-mute hover:bg-white/[0.04] hover:text-bone"}`}
            >
              <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${tab === t.id ? "text-gold" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
              {t.id === "leads" && newCount > 0 ? <span className="num ml-auto rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-ink">{newCount}</span> : null}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/[0.07] p-3">
          <a href="/" target="_blank" className="block rounded-xl px-3 py-2.5 text-[13px] text-mute hover:bg-white/[0.04] hover:text-bone">
            Открыть сайт ↗
          </a>
          <button onClick={logout} className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-mute hover:bg-white/[0.04] hover:text-bone">
            Выйти
          </button>
        </div>
      </aside>

      {/* Шапка (телефон) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-ink/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-auto" />
          <span className="font-display text-[13px] font-bold tracking-[0.14em]">OZOD · ADMIN</span>
        </div>
        <button onClick={logout} className="text-[13px] text-mute">
          Выйти
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
        <h1 className="mb-6 font-display text-2xl font-bold uppercase text-bone md:mb-8 md:text-3xl">{tabsMeta.find((t) => t.id === tab)?.label}</h1>
        {tab === "home" && <Overview leads={leads} logins={props.logins} security={props.security} portfolio={props.portfolio} go={setTab} />}
        {tab === "leads" && <Leads leads={leads} setLeads={setLeads} toast={toast.show} />}
        {tab === "prices" && <PricesForm initial={props.prices} toast={toast.show} onSaved={refresh} />}
        {tab === "portfolio" && <PortfolioManager items={props.portfolio} toast={toast.show} onChange={refresh} />}
        {tab === "settings" && <Settings contacts={props.contacts} logins={props.logins} security={props.security} toast={toast.show} onSaved={refresh} />}
      </main>

      {/* Нижнее меню (телефон) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/[0.07] bg-coal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {tabsMeta.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] ${tab === t.id ? "text-gold" : "text-mute"}`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            {t.label}
            {t.id === "leads" && newCount > 0 ? <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-gold" /> : null}
          </button>
        ))}
      </nav>

      <Toast msg={toast.msg} onDone={toast.clear} />
    </div>
  );
}

/* ───────────────────────── Обзор ───────────────────────── */

type Period = "today" | "7d" | "30d" | "all";
const periods: { id: Period; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "all", label: "Всё время" },
];
const TZ = "Asia/Tashkent";
const dayKey = (d: Date) => d.toLocaleDateString("ru-RU", { timeZone: TZ });

function Overview({ leads, logins, security, portfolio, go }: { leads: Lead[]; logins: LoginEntry[]; security: Security; portfolio: PortfolioItem[]; go: (t: Tab) => void }) {
  const [period, setPeriod] = useState<Period>("7d");

  const data = useMemo(() => {
    const now = Date.now();
    const day = 864e5;
    const today = dayKey(new Date());
    const inPeriod = (l: Lead) => {
      const t = +new Date(l.createdAt);
      if (period === "today") return dayKey(new Date(t)) === today;
      if (period === "7d") return now - t < 7 * day;
      if (period === "30d") return now - t < 30 * day;
      return true;
    };
    const list = leads.filter(inPeriod);
    const by = (s: LeadStatus) => list.filter((l) => l.status === s).length;
    const priced = list.filter((l) => l.total && l.status !== "lost");
    const sum = priced.reduce((a, l) => a + (l.total ?? 0), 0);

    // столбики: по часам за сегодня, по дням за 7/30 дней, по месяцам за всё время
    let buckets: { label: string; key: string; n: number }[];
    let keyOf: (d: Date) => string;
    if (period === "today") {
      buckets = Array.from({ length: 24 }, (_, h) => ({ label: h % 3 === 0 ? String(h).padStart(2, "0") : "", key: String(h), n: 0 }));
      keyOf = (d) => String(Number(d.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ })) % 24);
    } else if (period === "all") {
      buckets = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i), 1);
        return { label: d.toLocaleDateString("ru-RU", { month: "short", timeZone: TZ }).replace(".", ""), key: `${d.getFullYear()}-${d.getMonth()}`, n: 0 };
      });
      keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    } else {
      const n = period === "7d" ? 7 : 30;
      buckets = Array.from({ length: n }, (_, i) => {
        const d = new Date(now - (n - 1 - i) * day);
        const show = n === 7 || i % 5 === 4;
        return { label: show ? d.toLocaleDateString("ru-RU", n === 7 ? { day: "2-digit", month: "short", timeZone: TZ } : { day: "2-digit", timeZone: TZ }).replace(".", "") : "", key: dayKey(d), n: 0 };
      });
      keyOf = dayKey;
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const l of list) {
      const i = idx.get(keyOf(new Date(l.createdAt)));
      if (i !== undefined) buckets[i].n++;
    }
    return {
      total: list.length,
      byStatus: { new: by("new"), work: by("work"), done: by("done"), lost: by("lost") } as Record<LeadStatus, number>,
      sum,
      avg: priced.length ? sum / priced.length : 0,
      buckets,
      max: Math.max(1, ...buckets.map((b) => b.n)),
    };
  }, [leads, period]);

  const conv = data.total ? Math.round((data.byStatus.done / data.total) * 100) : 0;
  const failed = logins.filter((l) => !l.ok && Date.now() - +new Date(l.at) < 864e5).length;
  const checks = [
    { ok: security.telegram, label: security.telegram ? "Telegram-бот подключён" : "Telegram-бот не подключён", fix: "TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env.local" },
    { ok: security.strongPassword, label: security.strongPassword ? "Надёжный пароль" : "Пароль короче 12 символов", fix: "Смените ADMIN_PASSWORD" },
    { ok: security.secret, label: security.secret ? "Секрет сессии задан" : "Секрет сессии не задан", fix: "ADMIN_SECRET — 32+ символа" },
    { ok: failed <= 5, label: `Неудачных входов за сутки: ${failed}`, fix: "Возможен подбор пароля" },
  ];

  return (
    <div className="space-y-4">
      <Segmented value={period} onChange={setPeriod} options={periods.map((p) => ({ value: p.id, label: p.label }))} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Заявок" value={String(data.total)} hint={`${data.byStatus.new} ждут звонка`} accent />
        <Stat label="Выполнено" value={String(data.byStatus.done)} hint={`конверсия ${conv}%`} />
        <Stat label="Сумма расчётов" value={money(data.sum)} hint="сум, без отказов" />
        <Stat label="Средний расчёт" value={money(data.avg)} hint="сум на заявку" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Динамика заявок" desc={periods.find((p) => p.id === period)?.label}>
            <div className="flex h-44 items-end gap-[3px] sm:gap-1.5">
              {data.buckets.map((b) => (
                <div key={b.key} className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                  {b.n ? <span className="num absolute top-0 font-mono text-[10px] text-mute opacity-0 transition-opacity group-hover:opacity-100">{b.n}</span> : null}
                  <div className={`w-full rounded-t-[4px] transition-colors ${b.n ? "bg-gold/85 group-hover:bg-gold" : "bg-white/[0.06]"}`} style={{ height: `${b.n ? Math.max(6, (b.n / data.max) * 82) : 3}%` }} />
                  <span className="num mt-2 h-3 whitespace-nowrap font-mono text-[9.5px] text-mute">{b.label}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
        <Section title="Воронка">
          <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-white/[0.06]">
            {statusOrder.map((s) => (data.byStatus[s] ? <span key={s} className={statusMeta[s].bar} style={{ flex: `${data.byStatus[s]} 1 0` }} /> : null))}
          </div>
          <ul className="mt-5 space-y-3">
            {statusOrder.map((s) => (
              <li key={s} className="flex items-center gap-3 text-[14px]">
                <span className={`h-2.5 w-2.5 rounded-full ${statusMeta[s].bar}`} />
                <span className="flex-1 text-bone">{statusMeta[s].label}</span>
                <span className="num font-mono text-mute">{data.byStatus[s]}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Последние заявки" action={<button onClick={() => go("leads")} className="text-[13px] text-gold hover:underline">Все заявки →</button>}>
            {leads.length === 0 ? (
              <p className="text-sm text-mute">Заявок пока нет — они появятся здесь и придут в Telegram.</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {leads.slice(0, 6).map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-3 text-[14px]">
                    <StatusBadge s={l.status} />
                    <span className="min-w-0 flex-1 truncate text-bone">{l.name}</span>
                    <span className="num hidden font-mono text-[12px] text-mute sm:block">{fmtDate(l.createdAt)}</span>
                    <span className="num w-28 text-right font-mono text-[13px] text-gold">{l.total ? money(l.total) : "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
        <Section title="Состояние">
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-[13px]">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.ok ? "bg-emerald-400" : "bg-gold"}`} />
                <span>
                  <span className="text-bone">{c.label}</span>
                  {!c.ok ? <span className="block text-mute">{c.fix}</span> : null}
                </span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-[13px]">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-bone">Своих фото: {portfolio.length}</span>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: LeadStatus }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta[s].cls}`}>{statusMeta[s].label}</span>;
}

/** Переключатель-«таблетка» вместо стандартного выпадающего списка. */
function Segmented<T extends string>({ value, onChange, options, small }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; small?: boolean }) {
  return (
    <div className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:max-w-full sm:px-0" role="radiogroup">
      <div className="inline-flex gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`shrink-0 whitespace-nowrap rounded-full border font-medium transition-colors ${small ? "px-3 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]"} ${value === o.value ? "border-gold bg-gold text-ink" : "border-white/10 text-mute hover:border-white/25 hover:text-bone"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Заявки ───────────────────────── */

function Leads({ leads, setLeads, toast }: { leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; toast: (t: string, ok?: boolean) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of statusOrder) c[s] = leads.filter((l) => l.status === s).length;
    return c;
  }, [leads]);

  const shown = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const qd = qq.replace(/\D/g, "");
    return leads.filter(
      (l) => (filter === "all" || l.status === filter) && (!qq || l.name.toLowerCase().includes(qq) || (qd && l.phone.replace(/\D/g, "").includes(qd)) || l.comment.toLowerCase().includes(qq)),
    );
  }, [leads, q, filter]);

  async function patch(id: string, p: Partial<Pick<Lead, "status" | "note">>) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));
    const r = await api("/api/admin/leads", { method: "PATCH", json: { id, ...p } });
    if (!r.ok) {
      setLeads(prev);
      toast(r.error, false);
    } else toast(p.status ? `Статус: ${statusMeta[p.status].label}` : "Заметка сохранена");
  }

  async function remove(id: string) {
    if (!confirm("Удалить заявку? Это нельзя отменить.")) return;
    const r = await api(`/api/admin/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) {
      setLeads((ls) => ls.filter((l) => l.id !== id));
      toast("Заявка удалена");
    } else toast(r.error, false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input className="field !rounded-full !py-2.5 !pl-10" placeholder="Имя, телефон или комментарий" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[{ value: "all" as const, label: `Все ${counts.all}` }, ...statusOrder.map((s) => ({ value: s, label: `${statusMeta[s].label} ${counts[s]}` }))]}
        />
        <a href="/api/admin/leads?format=csv" className="btn btn-ghost self-start !rounded-full !px-5 !py-2 !text-[11px] lg:ml-auto lg:self-auto">
          Скачать Excel
        </a>
      </div>

      {shown.length === 0 ? (
        <p className="card p-10 text-center text-sm text-mute">{leads.length ? "Ничего не найдено." : "Заявок пока нет. Они появятся здесь и придут в Telegram."}</p>
      ) : (
        <div>
          <ul className="space-y-2">
            {shown.map((l) => (
              <LeadRow key={l.id} lead={l} open={openId === l.id} onToggle={() => setOpenId((v) => (v === l.id ? null : l.id))} onPatch={(p) => patch(l.id, p)} onRemove={() => remove(l.id)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead: l, open, onToggle, onPatch, onRemove }: { lead: Lead; open: boolean; onToggle: () => void; onPatch: (p: Partial<Pick<Lead, "status" | "note">>) => void; onRemove: () => void }) {
  const [note, setNote] = useState(l.note);
  const digits = l.phone.replace(/\D/g, "");
  const units = { points: "шт", lights: "шт", cable: "м", panel: "мод." } as const;
  const names = { points: "Точки", lights: "Светильники", cable: "Кабель", panel: "Щит" } as const;

  return (
    <li className={`overflow-hidden rounded-[26px] border transition-colors ${open ? "border-gold/30 bg-white/[0.035]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-5 py-2.5 text-left sm:px-6 md:grid-cols-[110px_1fr_140px_110px_20px]"
      >
        <span className="col-start-2 row-start-1 justify-self-end md:col-auto md:row-auto md:justify-self-start">
          <StatusBadge s={l.status} />
        </span>
        <span className="col-start-1 row-start-1 min-w-0 md:col-auto md:row-auto">
          <span className="block truncate text-[14px] font-medium text-bone">
            {l.name}
            {l.note ? <span className="ml-2 text-[11px] font-normal text-mute">· есть заметка</span> : null}
          </span>
          <span className="num block font-mono text-[12px] text-gold">{l.phone}</span>
        </span>
        <span className="num col-start-1 font-mono text-[13px] text-bone md:col-auto md:text-right">{l.total ? `${money(l.total)}` : <span className="text-mute">без расчёта</span>}</span>
        <span className="num col-start-2 justify-self-end font-mono text-[11.5px] text-mute md:col-auto">{fmtDate(l.createdAt)}</span>
        <span className="hidden justify-self-end text-mute transition-transform duration-300 md:block" style={{ transform: open ? "rotate(180deg)" : undefined }} aria-hidden>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="fade-in grid grid-cols-1 gap-4 border-t border-white/[0.06] px-5 py-4 sm:px-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Segmented small value={l.status} onChange={(s) => s !== l.status && onPatch({ status: s })} options={statusOrder.map((s) => ({ value: s, label: statusMeta[s].label }))} />
            {l.comment ? <p className="whitespace-pre-wrap rounded-xl bg-white/[0.03] p-3 text-[13px] text-bone/90">{l.comment}</p> : <p className="text-[13px] text-mute">Без комментария.</p>}
            {l.calc ? (
              <div className="rounded-xl border border-white/[0.07] p-3">
                <ul className="num grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[12px] text-mute">
                  {(Object.keys(names) as (keyof typeof names)[]).map((k) => (
                    <li key={k}>
                      {names[k]}: <span className="text-bone">{l.calc![k]}</span> {units[k]}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex items-baseline justify-between text-[12px] text-mute">
                  <span>
                    Тариф: {l.calc.tariff === "pro" ? "бетон" : "стандарт"} · {l.lang.toUpperCase()}
                  </span>
                  <span className="num font-mono text-[15px] font-bold text-gold">{money(l.total ?? 0)} сум</span>
                </p>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <textarea
              className="field min-h-[96px] flex-1 resize-y !rounded-2xl !py-2.5 text-[13px]"
              placeholder="Заметка: договорились, адрес, сроки…"
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== l.note && onPatch({ note })}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <a href={`tel:+${digits}`} className="btn btn-gold !rounded-full !px-2 !py-2.5 !text-[11px]">
                Позвонить
              </a>
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !rounded-full !px-2 !py-2.5 !text-[11px]">
                WhatsApp
              </a>
              <button onClick={() => navigator.clipboard?.writeText(l.phone)} className="btn btn-ghost !rounded-full !px-2 !py-2.5 !text-[11px]">
                Копировать
              </button>
              <button onClick={onRemove} className="btn btn-ghost !rounded-full !px-2 !py-2.5 !text-[11px] hover:!border-red-400/50 hover:!text-red-300">
                Удалить
              </button>
            </div>
            <p className="num font-mono text-[11px] text-mute">Telegram: {l.telegram === "sent" ? "отправлено" : l.telegram === "failed" ? "ошибка отправки" : "не настроен"}</p>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/* ───────────────────────── Цены ───────────────────────── */

const priceFields: { key: keyof Prices; label: string; unit: string }[] = [
  { key: "pointBase", label: "Черновая точка — Стандарт", unit: "сум / шт" },
  { key: "pointPro", label: "Черновая точка — Бетон / монолит", unit: "сум / шт" },
  { key: "light", label: "Монтаж светильника", unit: "сум / шт" },
  { key: "cable", label: "Прокладка кабеля", unit: "сум / м" },
  { key: "panel", label: "Сборка щита", unit: "сум / модуль" },
];

function PricesForm({ initial, toast, onSaved }: { initial: Prices; toast: (t: string, ok?: boolean) => void; onSaved: () => void }) {
  const toStr = (p: Prices) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) as Record<keyof Prices, string>;
  const [values, setValues] = useState(() => toStr(initial));
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v.replace(/\s/g, "")) || 0])) as Prices, [values]);
  const dirty = priceFields.some((f) => parsed[f.key] !== initial[f.key]);

  // предпросмотр: квартира 75 м² по новым и по текущим ценам
  const c = calcPresets.flat;
  const sample = { points: Math.round(areaRange.initial * c.points), lights: Math.round(areaRange.initial * c.lights), cable: Math.round((areaRange.initial * c.cable) / 10) * 10, panel: Math.round(c.panelBase + areaRange.initial * c.panel), tariff: "base" as const };
  const now = calculate(sample, initial).total;
  const next = calculate(sample, parsed).total;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    // защита от опечаток: цена в 5 раз меньше или в 10 раз больше обычной
    const odd = priceFields.filter((f) => parsed[f.key] < defaultPrices[f.key] / 5 || parsed[f.key] > defaultPrices[f.key] * 10);
    if (odd.length && !confirm(`Проверьте цены — они выглядят необычно:\n\n${odd.map((f) => `• ${f.label}: ${money(parsed[f.key])} сум`).join("\n")}\n\nВсё равно сохранить?`)) return;
    setBusy(true);
    const r = await api("/api/admin/prices", { method: "PUT", json: parsed });
    setBusy(false);
    if (r.ok) {
      toast("Цены сохранены — уже на сайте");
      onSaved();
    } else toast(r.error, false);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <form onSubmit={save} className="lg:col-span-2">
        <Section title="Цены калькулятора" desc="Меняются на сайте сразу после сохранения.">
          <div className="space-y-4">
            {priceFields.map((f) => (
              <label key={f.key} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_190px]">
                <span>
                  <span className="block text-[14px] text-bone">{f.label}</span>
                  <span className="num font-mono text-[11px] text-mute">
                    по умолчанию {money(defaultPrices[f.key])} · {f.unit}
                  </span>
                </span>
                <input
                  className={`field num text-right font-mono ${parsed[f.key] !== initial[f.key] ? "!border-gold/60" : ""}`}
                  inputMode="numeric"
                  value={values[f.key]}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value.replace(/[^\d\s]/g, "") }))}
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button disabled={busy || !dirty} className="btn btn-gold disabled:opacity-40">
              {busy ? "Сохраняем…" : "Сохранить"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setValues(toStr(defaultPrices))}>
              По умолчанию
            </button>
            {dirty ? (
              <button type="button" className="btn btn-ghost" onClick={() => setValues(toStr(initial))}>
                Отменить
              </button>
            ) : null}
          </div>
        </Section>
      </form>
      <Section title="Предпросмотр" desc={`Квартира ${areaRange.initial} м², автоподбор`}>
        <p className="kicker">Сейчас на сайте</p>
        <p className="num mt-2 font-display text-2xl font-bold text-bone">{money(now)} сум</p>
        <p className="kicker mt-5">С новыми ценами</p>
        <p className="num mt-2 font-display text-2xl font-bold text-gold">{money(next)} сум</p>
        {next !== now ? (
          <p className={`num mt-2 text-[13px] ${next > now ? "text-gold" : "text-emerald-300"}`}>
            {next > now ? "+" : "−"}
            {money(Math.abs(next - now))} сум ({now ? Math.round(((next - now) / now) * 100) : 0}%)
          </p>
        ) : null}
      </Section>
    </div>
  );
}

/* ───────────────────────── Портфолио ───────────────────────── */

function PortfolioManager({ items: initialItems, toast, onChange }: { items: PortfolioItem[]; toast: (t: string, ok?: boolean) => void; onChange: () => void }) {
  const [items, setItems] = useState(initialItems);
  const [category, setCategory] = useState<Category>("panels");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setItems(initialItems), [initialItems]);
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), [files]);

  const pick = (list: FileList | null) => {
    if (!list) return;
    const ok = Array.from(list).filter((f) => /^image\/(jpeg|png|webp|avif)$/.test(f.type) && f.size <= 10 * 1024 * 1024);
    if (ok.length < list.length) toast("Часть файлов пропущена: нужен JPG/PNG/WEBP до 10 МБ", false);
    setFiles((cur) => [...cur, ...ok.slice(0, 20 - cur.length).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  async function upload() {
    if (!files.length) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("category", category);
    fd.set("caption", caption);
    files.forEach((f) => fd.append("files", f.file));
    const r = await api("/api/admin/portfolio", { method: "POST", body: fd });
    setBusy(false);
    if (r.ok) {
      toast(`Загружено: ${(r.data.added as unknown[] | undefined)?.length ?? 0}`);
      setFiles([]);
      setCaption("");
      onChange();
    } else toast(r.error, false);
  }

  async function save(id: string, patch: Partial<Pick<PortfolioItem, "caption" | "category">>) {
    setItems((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    const r = await api("/api/admin/portfolio", { method: "PATCH", json: { id, ...patch } });
    if (r.ok) toast("Сохранено");
    else toast(r.error, false);
    onChange();
  }

  async function move(id: string, dir: -1 | 1) {
    const cat = items.find((p) => p.id === id)?.category;
    const same = items.filter((p) => p.category === cat);
    const i = same.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= same.length) return;
    const a = items.indexOf(same[i]);
    const b = items.indexOf(same[j]);
    const next = [...items];
    [next[a], next[b]] = [next[b], next[a]];
    setItems(next);
    const r = await api("/api/admin/portfolio", { method: "PATCH", json: { order: next.map((p) => p.id) } });
    if (!r.ok) toast(r.error, false);
    onChange();
  }

  async function remove(id: string) {
    if (!confirm("Удалить фото с сайта?")) return;
    const r = await api(`/api/admin/portfolio?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) {
      setItems((s) => s.filter((p) => p.id !== id));
      toast("Фото удалено");
      onChange();
    } else toast(r.error, false);
  }

  return (
    <div className="space-y-4">
      <Section title="Загрузить фото" desc="Как только у направления появятся свои фото, они заменят стандартные из КП. Порядок — как в списке ниже.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div
            onDragOver={(e) => (e.preventDefault(), setOver(true))}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              pick(e.dataTransfer.files);
            }}
            onClick={() => input.current?.click()}
            className={`grid min-h-[180px] cursor-pointer place-items-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${over ? "border-gold bg-gold/[0.06]" : "border-white/12 hover:border-white/25"}`}
          >
            {files.length ? (
              <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-5" onClick={(e) => e.stopPropagation()}>
                {files.map((f, i) => (
                  <div key={f.url} className="relative aspect-square overflow-hidden rounded-lg bg-graphite">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setFiles((s) => s.filter((_, k) => k !== i))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-bone" aria-label="Убрать">
                      <Close className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={() => input.current?.click()} className="grid aspect-square place-items-center rounded-lg border border-dashed border-white/15 text-2xl text-mute hover:text-bone">
                  +
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[15px] text-bone">Перетащите фото сюда или нажмите</p>
                <p className="mt-1 text-[12px] text-mute">JPG, PNG, WEBP · до 10 МБ · до 20 файлов</p>
              </div>
            )}
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => (pick(e.target.files), (e.target.value = ""))} />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <span className="kicker mb-2 block">Направление</span>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Направление">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={category === c}
                    onClick={() => setCategory(c)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-[13px] transition-colors ${category === c ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-mute hover:border-white/25 hover:text-bone"}`}
                  >
                    {catLabel[c]}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className="kicker mb-2 block">Подпись</span>
              <input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={120} placeholder="ЖК «Намуна», щит 36 модулей" />
            </label>
            <button onClick={upload} disabled={busy || !files.length} className="btn btn-gold mt-auto disabled:opacity-40">
              {busy ? "Загружаем…" : files.length ? `Загрузить (${files.length})` : "Выберите фото"}
            </button>
          </div>
        </div>
      </Section>

      {categories.map((cat) => {
        const list = items.filter((p) => p.category === cat);
        return (
          <Section key={cat} title={catLabel[cat]} desc={list.length ? `${list.length} фото на сайте` : "Сейчас на сайте стандартные фото из КП"}>
            {list.length === 0 ? null : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((p, i) => (
                  <li key={p.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink">
                    <div className="relative aspect-[4/3] bg-graphite">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/media/${p.file}`} alt={p.caption} className="h-full w-full object-cover" loading="lazy" />
                      <span className="num absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[11px] text-bone">{i + 1}</span>
                      <button onClick={() => remove(p.id)} aria-label="Удалить" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-bone hover:text-red-300">
                        <Close className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 p-2.5">
                      <input
                        className="w-full rounded-lg bg-transparent px-1.5 py-1 text-[12.5px] text-bone outline-none ring-1 ring-transparent placeholder:text-mute/60 focus:ring-gold/50"
                        defaultValue={p.caption}
                        placeholder="Подпись…"
                        maxLength={120}
                        onBlur={(e) => e.target.value !== p.caption && save(p.id, { caption: e.target.value })}
                      />
                      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Направление">
                        {categories.map((c) => (
                          <button
                            key={c}
                            type="button"
                            role="radio"
                            aria-checked={p.category === c}
                            onClick={() => p.category !== c && save(p.id, { category: c })}
                            className={`rounded-md px-1.5 py-1 text-[10.5px] transition-colors ${p.category === c ? "bg-gold/15 text-gold" : "text-mute hover:bg-white/5 hover:text-bone"}`}
                          >
                            {catLabel[c]}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="mr-auto text-[11px] text-mute">Порядок</span>
                        <button onClick={() => move(p.id, -1)} disabled={i === 0} aria-label="Раньше" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mute hover:text-bone disabled:opacity-30">
                          ←
                        </button>
                        <button onClick={() => move(p.id, 1)} disabled={i === list.length - 1} aria-label="Позже" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mute hover:text-bone disabled:opacity-30">
                          →
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Настройки ───────────────────────── */

function Settings({ contacts, logins, security, toast, onSaved }: { contacts: Contacts; logins: LoginEntry[]; security: Security; toast: (t: string, ok?: boolean) => void; onSaved: () => void }) {
  const [c, setC] = useState(contacts);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await api("/api/admin/settings", { method: "PUT", json: c });
    setBusy(false);
    if (r.ok) {
      toast("Контакты обновлены на сайте");
      onSaved();
    } else toast(r.error, false);
  }

  async function testTelegram() {
    setTesting(true);
    const r = await api("/api/admin/settings", { method: "POST" });
    setTesting(false);
    toast(r.ok ? "Тестовое сообщение отправлено в Telegram" : r.error, r.ok);
  }

  const fields: { key: keyof Contacts; label: string; hint: string }[] = [
    { key: "phone", label: "Телефон", hint: "+998 99 821 11 20" },
    { key: "whatsapp", label: "WhatsApp", hint: "номер, если отличается" },
    { key: "telegram", label: "Telegram", hint: "ник без @, напр. ozod_electric" },
    { key: "instagram", label: "Instagram", hint: "ник без @" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form onSubmit={save}>
        <Section title="Контакты на сайте" desc="Меняются везде: шапка, кнопки, контакты, WhatsApp-расчёт.">
          <div className="space-y-3">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="kicker mb-1.5 block">{f.label}</span>
                <input className="field" value={c[f.key]} placeholder={f.hint} onChange={(e) => setC((s) => ({ ...s, [f.key]: e.target.value }))} />
              </label>
            ))}
          </div>
          <button disabled={busy} className="btn btn-gold mt-5 disabled:opacity-50">
            {busy ? "Сохраняем…" : "Сохранить контакты"}
          </button>
        </Section>
      </form>

      <div className="space-y-4">
        <Section title="Telegram-уведомления" desc={security.telegram ? "Бот подключён — заявки приходят в чат." : "Бот не настроен: заявки сохраняются только здесь."}>
          <button onClick={testTelegram} disabled={testing} className="btn btn-ghost disabled:opacity-50">
            {testing ? "Отправляем…" : "Отправить тестовое сообщение"}
          </button>
        </Section>

        <Section title="Журнал входов" desc="Последние попытки входа в админку.">
          {logins.length === 0 ? (
            <p className="text-sm text-mute">Пока пусто.</p>
          ) : (
            <ul className="max-h-72 divide-y divide-white/[0.06] overflow-y-auto pr-1">
              {logins.slice(0, 30).map((l, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-[13px]">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${l.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="num font-mono text-mute">{fmtDate(l.at)}</span>
                  <span className="num min-w-0 flex-1 truncate font-mono text-bone/80">{l.ip}</span>
                  <span className={l.ok ? "text-emerald-300" : "text-red-300"}>{l.ok ? "вход" : "неверный пароль"}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
