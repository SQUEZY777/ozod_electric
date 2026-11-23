/**
 * ЕДИНЫЙ КОНФИГ САЙТА OZOD ELECTRIC
 * ------------------------------------------------------------
 * Контакты, базовые цены калькулятора и диапазоны ползунков.
 * Цены здесь — значения по умолчанию. Их можно переопределить
 * в админ-панели (/admin), тогда они сохраняются в data/store.json.
 */

export const site = {
  brand: "OZOD ELECTRIC",
  tagline: "Электромонтаж под ключ",
  city: "Ташкент",
  year: 2026,
  url: "https://ozod-electric.uz",

  contacts: {
    phone: "+998 99 821 11 20",
    phoneHref: "tel:+998998211120",
    whatsapp: "https://wa.me/998998211120",
    telegram: "@ozodbbx",
    telegramHref: "https://t.me/ozodbbx",
    instagram: "@ozod.electric",
    instagramHref: "https://instagram.com/ozod.electric",
  },
} as const;

/** Цены калькулятора, сум. Ключи совпадают с полями в админке. */
export type Prices = {
  /** Черновая точка — тариф «Стандарт» */
  pointBase: number;
  /** Черновая точка — тариф «Сложный» (бетон, монолит, высота) */
  pointPro: number;
  /** Монтаж одного светильника */
  light: number;
  /** Прокладка кабеля, за 1 метр */
  cable: number;
  /** Сборка щита, за 1 модуль (автомат / УЗО / реле) */
  panel: number;
};

export const defaultPrices: Prices = {
  pointBase: 80_000,
  pointPro: 90_000,
  light: 60_000,
  cable: 7_000,
  panel: 45_000,
};

/** Диапазоны ползунков и стартовые значения — калькулятор никогда не стартует с нуля. */
export const calcRanges = {
  points: { min: 5, max: 400, step: 1, initial: 80 },
  lights: { min: 0, max: 150, step: 1, initial: 24 },
  cable: { min: 0, max: 2000, step: 10, initial: 350 },
  panel: { min: 0, max: 120, step: 1, initial: 24 },
} as const;

export type CalcKey = keyof typeof calcRanges;
export type Tariff = "base" | "pro";

/**
 * Автоподбор калькулятора по типу объекта и площади (м²).
 * Коэффициенты — на 1 м²; клиент потом может поправить ползунки вручную.
 */
export const objectTypes = ["flat", "house", "office"] as const;
export type ObjectType = (typeof objectTypes)[number];
export const calcPresets: Record<ObjectType, { points: number; lights: number; cable: number; panelBase: number; panel: number }> = {
  flat: { points: 1.1, lights: 0.35, cable: 5.5, panelBase: 12, panel: 0.12 },
  house: { points: 1.0, lights: 0.3, cable: 6.5, panelBase: 18, panel: 0.14 },
  office: { points: 0.8, lights: 0.45, cable: 5, panelBase: 12, panel: 0.1 },
};
export const areaRange = { min: 20, max: 600, step: 5, initial: 75 } as const;

/** Гарантийные сроки — показываются в блоке «Официальная гарантия». */
export const guarantees = [
  { years: 5, key: "g5" },
  { years: 3, key: "g3" },
  { years: 2, key: "g2" },
] as const;

/** Категории портфолио = 4 направления. */
export const categories = ["panels", "rough", "lowcurrent", "lighting"] as const;
export type Category = (typeof categories)[number];

/**
 * Фото по умолчанию (вырезаны из коммерческого предложения), лежат в public/portfolio.
 * w/h — пропорции: раскладка строится без обрезки кадров.
 * Если в админке загрузить фото для направления — они заменят эти.
 */
export const defaultPhotos = {
  "panels-1": { w: 730, h: 1556 },
  "panels-2": { w: 648, h: 398 },
  "panels-3": { w: 648, h: 548 },
  "panels-4": { w: 648, h: 504 },
  "rough-1": { w: 682, h: 730 },
  "rough-2": { w: 690, h: 730 },
  "rough-3": { w: 700, h: 734 },
  "rough-4": { w: 682, h: 612 },
  "lowcurrent-1": { w: 842, h: 810 },
  "lowcurrent-2": { w: 538, h: 808 },
  "lowcurrent-3": { w: 932, h: 602 },
  "lowcurrent-4": { w: 452, h: 600 },
  "lighting-1": { w: 1484, h: 560 },
  "lighting-2": { w: 892, h: 582 },
  "lighting-3": { w: 562, h: 582 },
  "lighting-warm": { w: 742, h: 262 },
  "lighting-neutral": { w: 698, h: 262 },
} as const;
export type PhotoId = keyof typeof defaultPhotos;

/**
 * Раскладка фото как на страницах КП: строки → элементы;
 * массив внутри строки = несколько фото друг над другом.
 */
export type LayoutItem = PhotoId | PhotoId[];
export const photoLayouts: Record<Category, LayoutItem[][]> = {
  panels: [["panels-1", ["panels-2", "panels-3", "panels-4"]]],
  rough: [
    ["rough-1", "rough-2"],
    ["rough-4", "rough-3"],
  ],
  lowcurrent: [
    ["lowcurrent-1", "lowcurrent-2"],
    ["lowcurrent-3", "lowcurrent-4"],
  ],
  lighting: [["lighting-1"], ["lighting-warm", "lighting-neutral"], ["lighting-2", "lighting-3"]],
};
