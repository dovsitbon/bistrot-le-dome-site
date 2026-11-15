import Link from "next/link";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { amount, formatDay } from "@/lib/format";
import { CATEGORIES, CARTE_CHECKED, SIGNATURES, subName, type Category, type Item, type Section } from "@/lib/carte";
import { pagePath } from "@/lib/pages";
import { Pic, type SlotId } from "@/components/Pic";
import { LeafIcon } from "@/components/icons";
import { firstImg } from "@/lib/media";

// Photo de chaque catégorie (ou emplacement dessiné tant qu'elle manque)
const COVER: Record<Category["id"], { src: string; slot?: SlotId } | null> = {
  cuisine: { src: "/media/plats/escargots.jpg" },
  desserts: { src: firstImg(["/media/desserts/creme-brulee.jpg"]) ? "/media/desserts/creme-brulee.jpg" : "/media/desserts/tiramisu.jpg" },
  vins: { src: "/media/bar/cave.jpg", slot: "vins" },
  bar: { src: "/media/bar/tireuses.jpg" },
  boissons: null,
};

/** Une ligne de carte : nom français, pointillés, prix ; traduction et description dessous. */
export function CarteItem({ it, lang, d, className = "", level = "h4" }: { it: Item; lang: Locale; d: Dict; className?: string; level?: "h3" | "h4" }) {
  const H = level;
  const sub = subName(it, lang);
  const desc = it.d?.[lang];
  return (
    <li className={`py-3.5 ${className}`}>
      <div className="flex items-baseline gap-3">
        <H className="text-[1.0625rem] leading-snug font-medium">
          {it.fr}
          {it.veg && (
            <span className="ms-2 inline-flex translate-y-[1px] items-center text-open" title={d.carte.veg}>
              <LeafIcon className="h-3.5 w-3.5" />
              <span className="sr-only">{d.carte.veg}</span>
            </span>
          )}
        </H>
        <span className="dots" aria-hidden="true" />
        <p className="shrink-0 text-end tabular-nums">
          {it.p.map((p, i) => (
            <span key={i} className="block leading-snug">
              {p.l && <span className="me-2 text-[0.8125rem] text-muted">{p.l}</span>}
              {amount(p.v, lang)}
            </span>
          ))}
        </p>
      </div>
      {(sub || desc) && (
        <p className="mt-0.5 max-w-[34rem] text-[0.9375rem] leading-snug text-muted">
          {sub && <span className="display italic text-ink/85">{sub}</span>}
          {sub && desc && <span aria-hidden="true"> · </span>}
          {desc}
        </p>
      )}
    </li>
  );
}

function CarteSection({ s, lang, d }: { s: Section; lang: Locale; d: Dict }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-t`} className="scroll-mt-40 break-inside-avoid">
      <div className="rule pt-3">
        <h3 id={`${s.id}-t`} className="display text-[1.5rem] md:text-[1.75rem]">
          {s[lang]}
        </h3>
        {s.note && <p className="mt-1 text-[0.9375rem] text-brass-ink italic">{s.note[lang]}</p>}
      </div>
      <ul className="mt-2 divide-y divide-line/70">
        {s.items.map((it) => (
          <CarteItem key={it.id} it={it} lang={lang} d={d} />
        ))}
      </ul>
    </section>
  );
}

/** Barre des catégories, collée sous l'en-tête pendant la lecture de la carte. */
export function CarteNav({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <nav aria-label={d.carte.tabs} className="sticky top-16 z-30 border-y border-line bg-paper/95 backdrop-blur-sm md:top-[4.75rem]">
      <ul className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 md:px-6">
        {CATEGORIES.map((c) => (
          <li key={c.id}>
            <a href={`#c-${c.id}`} className="inline-flex min-h-12 items-center px-3 text-[0.9375rem] font-medium whitespace-nowrap decoration-brass underline-offset-[0.5em] hover:underline">
              {c[lang]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** La carte complète, en vraie page HTML : catégories, sections, prix. */
export function CarteFull({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <p className="mt-8 text-[0.9375rem] text-muted">
        {d.carte.euros} {d.carte.allergens}
      </p>
      {CATEGORIES.map((c, ci) => (
        <section key={c.id} id={`c-${c.id}`} aria-labelledby={`c-${c.id}-t`} className="scroll-mt-36 py-12 md:py-16">
          <div className="grid items-end gap-6 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-12">
            <h2 id={`c-${c.id}-t`} className="display text-[2.75rem] md:text-[4rem]">
              {c[lang]}
            </h2>
            {COVER[c.id] && <Pic src={COVER[c.id]!.src} slot={COVER[c.id]!.slot} d={d} sizes="(min-width: 768px) 22rem, 90vw" className="aspect-[16/10] max-md:hidden" priority={ci === 0} />}
          </div>
          <div className="mt-8 gap-x-14 md:columns-2 [&>section]:mb-10">
            {c.sections.map((s) => (
              <CarteSection key={s.id} s={s} lang={lang} d={d} />
            ))}
          </div>
        </section>
      ))}
      <p className="border-t border-line py-8 text-[0.875rem] text-muted">{fill(d.carte.checked, { date: formatDay(CARTE_CHECKED, lang, { day: "numeric", month: "long", year: "numeric" }) })}</p>
    </div>
  );
}

/** Aperçu de l'accueil : les grands classiques (sig: true), avec un lien vers toute la carte. */
export function CartePreview({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <div>
      <ul className="border-t border-line md:columns-2 md:gap-x-14">
        {SIGNATURES.map((it) => (
          <CarteItem key={it.id} it={it} lang={lang} d={d} className="break-inside-avoid border-b border-line/70" level="h3" />
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={pagePath("carte", lang)} className="btn-line">
          {d.carte.seeFull}
        </Link>
        <p className="text-[0.875rem] text-muted">{d.carte.euros}</p>
      </div>
    </div>
  );
}
