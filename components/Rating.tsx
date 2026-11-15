import site from "@/data/site.json";
import { fill, intlLocale, type Dict, type Locale } from "@/lib/i18n";
import { StarIcon } from "@/components/icons";

/** Note relevée sur Google (data/site.json → rating, avec la date du relevé), avec un lien vers la fiche. */
export function ratingValues(lang: Locale) {
  const nf = new Intl.NumberFormat(intlLocale[lang]);
  return {
    value: new Intl.NumberFormat(intlLocale[lang], { minimumFractionDigits: 1 }).format(site.rating.value),
    count: nf.format(site.rating.count),
    // « près de 1 900 avis » : arrondi à la centaine supérieure
    rounded: nf.format(Math.ceil(site.rating.count / 100) * 100),
  };
}

export function Rating({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const v = ratingValues(lang);
  return (
    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 hover:underline ${className}`} aria-label={fill(d.rating.aria, v)}>
      <span className="flex gap-0.5 text-[#d7b57a]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} className="h-3.5 w-3.5" />
        ))}
      </span>
      <span>
        <span className="font-medium">{fill(d.rating.label, v)}</span>
        <span className="opacity-85"> · {fill(d.rating.count, v)}</span>
      </span>
    </a>
  );
}
