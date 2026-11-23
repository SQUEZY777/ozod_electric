import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { defaultPrices, site, type Category, type Prices } from "@/config/site";
import type { CalcInput } from "./calc";

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const STORE_FILE = path.join(DATA_DIR, "store.json");

export type PortfolioItem = {
  id: string;
  file: string;
  category: Category;
  caption: string;
  createdAt: string;
};

export const leadStatuses = ["new", "work", "done", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  comment: string;
  lang: string;
  calc: CalcInput | null;
  total: number | null;
  telegram: "sent" | "failed" | "disabled";
  status: LeadStatus;
  note: string;
};

export type Contacts = {
  phone: string;
  telegram: string;
  instagram: string;
  whatsapp: string;
};

export type LoginEntry = { at: string; ip: string; ok: boolean };

type Store = {
  prices: Prices;
  portfolio: PortfolioItem[];
  leads: Lead[];
  contacts: Partial<Contacts>;
  logins: LoginEntry[];
};

/** Контакты по умолчанию — из src/config/site.ts. */
export const defaultContacts: Contacts = {
  phone: site.contacts.phone,
  telegram: site.contacts.telegramHref.replace("https://t.me/", ""),
  instagram: site.contacts.instagram.replace(/^@/, ""),
  whatsapp: site.contacts.phone,
};

const empty = (): Store => ({ prices: { ...defaultPrices }, portfolio: [], leads: [], contacts: {}, logins: [] });

async function read(): Promise<Store> {
  try {
    const raw = JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as Partial<Store>;
    return {
      prices: { ...defaultPrices, ...(raw.prices ?? {}) },
      portfolio: raw.portfolio ?? [],
      leads: (raw.leads ?? []).map((l) => ({ ...l, status: l.status ?? "new", note: l.note ?? "" })),
      contacts: raw.contacts ?? {},
      logins: raw.logins ?? [],
    };
  } catch {
    return empty();
  }
}

// Последовательная запись + атомарная замена файла: JSON не повредится при одновременных запросах.
let queue: Promise<unknown> = Promise.resolve();

async function mutate<T>(fn: (s: Store) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const s = await read();
    const result = await fn(s);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${STORE_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(s, null, 2), "utf8");
    await fs.rename(tmp, STORE_FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const getPrices = async () => (await read()).prices;
export const getPortfolio = async () => (await read()).portfolio;
export const getLeads = async () => (await read()).leads;
export const getLogins = async () => (await read()).logins;
export async function getContacts(): Promise<Contacts> {
  return { ...defaultContacts, ...(await read()).contacts };
}

export function setPrices(p: Prices) {
  return mutate((s) => {
    s.prices = p;
  });
}

export function setContacts(c: Partial<Contacts>) {
  return mutate((s) => {
    s.contacts = c;
  });
}

export function addPortfolio(item: Omit<PortfolioItem, "id" | "createdAt">) {
  return mutate((s) => {
    const full: PortfolioItem = { ...item, id: randomUUID(), createdAt: new Date().toISOString() };
    s.portfolio.push(full);
    return full;
  });
}

export function updatePortfolio(id: string, patch: Partial<Pick<PortfolioItem, "caption" | "category">>) {
  return mutate((s) => {
    const it = s.portfolio.find((p) => p.id === id);
    if (it) Object.assign(it, patch);
    return Boolean(it);
  });
}

/** Новый порядок фото: массив id. Неизвестные id игнорируются, пропущенные остаются в конце. */
export function reorderPortfolio(ids: string[]) {
  return mutate((s) => {
    const byId = new Map(s.portfolio.map((p) => [p.id, p]));
    const ordered = ids.map((id) => byId.get(id)).filter((p): p is PortfolioItem => Boolean(p));
    const rest = s.portfolio.filter((p) => !ids.includes(p.id));
    s.portfolio = [...ordered, ...rest];
  });
}

export function removePortfolio(id: string) {
  return mutate((s) => {
    const found = s.portfolio.find((p) => p.id === id) ?? null;
    s.portfolio = s.portfolio.filter((p) => p.id !== id);
    return found;
  });
}

export function addLead(lead: Omit<Lead, "id" | "createdAt" | "status" | "note">) {
  return mutate((s) => {
    const full: Lead = { ...lead, id: randomUUID(), createdAt: new Date().toISOString(), status: "new", note: "" };
    s.leads.unshift(full);
    s.leads = s.leads.slice(0, 5000);
    return full;
  });
}

export function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "note">>) {
  return mutate((s) => {
    const l = s.leads.find((x) => x.id === id);
    if (l) Object.assign(l, patch);
    return Boolean(l);
  });
}

export function removeLead(id: string) {
  return mutate((s) => {
    s.leads = s.leads.filter((l) => l.id !== id);
  });
}

export function logLogin(entry: LoginEntry) {
  return mutate((s) => {
    s.logins.unshift(entry);
    s.logins = s.logins.slice(0, 100);
  });
}
