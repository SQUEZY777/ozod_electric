"use client";

import { createContext, useContext } from "react";
import type { SiteContacts } from "@/lib/contacts";

const Ctx = createContext<SiteContacts | null>(null);

/** Контакты приходят с сервера (конфиг + правки из админки) и доступны любому компоненту. */
export function ContactsProvider({ value, children }: { value: SiteContacts; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContacts() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContacts must be used inside ContactsProvider");
  return c;
}
