import carte from "@/data/carte.json";
import daily from "@/data/menu-du-jour.json";
import type { Locale } from "@/lib/locales";

// La carte (data/carte.json) et le plat du jour (data/menu-du-jour.json), typés.

export type L = Record<Locale, string>;
export type Price = { l?: string; v: number };
export type Item = { id: string; fr: string; en?: string; es?: string; d?: L; p: Price[]; sig?: boolean; veg?: boolean; photo?: string };
export type Section = { id: string; fr: string; en: string; es: string; note?: L; items: Item[] };
export type CategoryId = "cuisine" | "desserts" | "vins" | "bar" | "boissons";
export type Category = { id: CategoryId; fr: string; en: string; es: string; sections: Section[] };

export const CATEGORIES = carte.categories as Category[];
export const CARTE_CHECKED = carte.checked;

const all = new Map<string, Item>(CATEGORIES.flatMap((c) => c.sections.flatMap((s) => s.items.map((i) => [i.id, i] as const))));
export const itemById = (id: string) => all.get(id) ?? null;
export const sectionById = (id: string) => CATEGORIES.flatMap((c) => c.sections).find((s) => s.id === id) ?? null;

/** Nom traduit affiché sous le nom français (rien en français, ni quand la traduction est identique). */
export function subName(it: Item, lang: Locale) {
  if (lang === "fr") return "";
  const t = it[lang] ?? "";
  return t && t !== it.fr ? t : "";
}

/** Les grands classiques mis en avant (sig: true), dans l'ordre de la carte. */
export const SIGNATURES = [...all.values()].filter((i) => i.sig);

export type DailyItem = { id: string; fr: { name: string; desc: string }; en: { name: string; desc: string }; es: { name: string; desc: string }; price: number | null; photo?: string };
export const DAILY = { updated: daily.updated, items: daily.items as DailyItem[] };
