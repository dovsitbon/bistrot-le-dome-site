import type { Locale } from "@/lib/locales";

// Pages secondaires et leurs adresses dans chaque langue.
export const PAGE_IDS = ["carte", "reserver", "groupes", "portedeversailles", "parisexpo", "legal"] as const;
export type PageId = (typeof PAGE_IDS)[number];

export const SLUGS: Record<PageId, Record<Locale, string>> = {
  carte: { fr: "la-carte", en: "menu", es: "carta" },
  reserver: { fr: "reserver", en: "book-a-table", es: "reservar" },
  groupes: { fr: "groupes-entreprises-salons", en: "groups-trade-fairs", es: "grupos-empresas-ferias" },
  portedeversailles: { fr: "restaurant-porte-de-versailles", en: "restaurant-porte-de-versailles", es: "restaurante-porte-de-versailles" },
  parisexpo: { fr: "restaurant-pres-paris-expo", en: "restaurant-near-paris-expo", es: "restaurante-cerca-paris-expo" },
  legal: { fr: "mentions-legales", en: "legal-notice", es: "aviso-legal" },
};

export const pagePath = (id: PageId, lang: Locale) => `/${lang}/${SLUGS[id][lang]}`;

export const pageOfSlug = (slug: string, lang: Locale) => PAGE_IDS.find((id) => SLUGS[id][lang] === slug) ?? null;
