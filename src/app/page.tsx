import { cookies } from "next/headers";
import { LangProvider } from "@/i18n/LangProvider";
import { getContacts, getPortfolio, getPrices } from "@/lib/store";
import { buildContacts } from "@/lib/contacts";
import { ContactsProvider } from "@/components/ContactsContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro, introScript } from "@/components/Intro";
import { ActionBar, ScrollProgress } from "@/components/Effects";
import { Services, type Photo } from "@/components/Services";
import { Calculator } from "@/components/Calculator";
import { Benefits, Contacts, Footer, Guarantee, Portfolio, Principles, Process } from "@/components/Sections";

// Цены и портфолио меняются из админки — страница всегда свежая.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [prices, portfolio, contacts, jar] = await Promise.all([getPrices(), getPortfolio(), getContacts(), cookies()]);
  const lang = jar.get("lang")?.value === "uz" ? "uz" : "ru";
  const photos: Photo[] = portfolio.map((p) => ({
    id: p.id,
    src: `/api/media/${p.file}`,
    caption: p.caption,
    category: p.category,
  }));

  return (
    <LangProvider initial={lang}>
      <ContactsProvider value={buildContacts(contacts)}>
      {/* выполняется до отрисовки интро: решает, показывать ли его */}
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <Intro />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Principles />
        <Services photos={photos} />
        <Benefits />
        <Calculator prices={prices} />
        <Process />
        <Guarantee />
        <Portfolio photos={photos} />
        <Contacts />
      </main>
      <Footer />
      <ActionBar />
      </ContactsProvider>
    </LangProvider>
  );
}
