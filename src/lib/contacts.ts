/** Контакты в «сыром» виде (как хранятся) → готовые ссылки для сайта. */
export type RawContacts = { phone: string; telegram: string; instagram: string; whatsapp: string };

export type SiteContacts = ReturnType<typeof buildContacts>;

const digits = (s: string) => s.replace(/\D/g, "");
const handle = (s: string) => s.trim().replace(/^@/, "").replace(/^https?:\/\/(t\.me|instagram\.com)\//i, "").replace(/\/$/, "");

export function buildContacts(c: RawContacts) {
  const tg = handle(c.telegram);
  const ig = handle(c.instagram);
  return {
    phone: c.phone,
    phoneHref: `tel:+${digits(c.phone)}`,
    telegram: `@${tg}`,
    telegramHref: `https://t.me/${encodeURIComponent(tg)}`,
    instagram: `@${ig}`,
    instagramHref: `https://instagram.com/${encodeURIComponent(ig)}`,
    whatsappNumber: digits(c.whatsapp || c.phone),
    whatsapp: `https://wa.me/${digits(c.whatsapp || c.phone)}`,
  };
}
