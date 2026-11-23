import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getContacts, getLeads, getLogins, getPortfolio, getPrices } from "@/lib/store";
import { telegramEnabled } from "@/lib/telegram";
import { AdminPanel } from "./AdminPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Админ-панель — OZOD ELECTRIC", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [prices, portfolio, leads, contacts, logins] = await Promise.all([getPrices(), getPortfolio(), getLeads(), getContacts(), getLogins()]);
  const security = {
    telegram: telegramEnabled(),
    secret: (process.env.ADMIN_SECRET ?? "").length >= 32,
    strongPassword: (process.env.ADMIN_PASSWORD ?? "").length >= 12,
  };
  return <AdminPanel prices={prices} portfolio={portfolio} leads={leads} contacts={contacts} logins={logins} security={security} />;
}
