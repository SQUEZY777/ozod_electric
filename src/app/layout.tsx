import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Montserrat, Inter, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const display = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "OZOD ELECTRIC — электромонтаж под ключ в Ташкенте",
  description:
    "Черновой электромонтаж, сборка электрощитов, слаботочные системы и освещение под ключ. Онлайн-калькулятор стоимости. Официальная гарантия до 5 лет.",
  openGraph: {
    title: "OZOD ELECTRIC — электромонтаж под ключ",
    description: "Электрика, которую не нужно переделывать. Гарантия до 5 лет.",
    type: "website",
    locale: "ru_RU",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get("lang")?.value === "uz" ? "uz" : "ru";
  return (
    <html lang={lang} suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
