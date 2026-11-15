"use client";

import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/lib/locales";
import { pageOfSlug, SLUGS } from "@/lib/pages";

/** « FR · EN · ES » : renvoie vers la même page dans l'autre langue (les adresses des pages sont traduites). */
export function LangSwitch({ lang, label, className = "" }: { lang: Locale; label: string; className?: string }) {
  const pathname = usePathname() || `/${lang}`;
  const slug = pathname.replace(/^\/(fr|en|es)\/?/, "").split("/")[0];
  const page = slug ? pageOfSlug(slug, lang) : null;
  const target = (l: Locale) => (page ? `/${l}/${SLUGS[page][l]}` : `/${l}`);

  return (
    <nav aria-label={label} className={`flex items-center gap-1.5 text-[0.75rem] font-medium tracking-[0.14em] ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && (
            <span aria-hidden="true" className="opacity-40">
              ·
            </span>
          )}
          <a
            href={target(l)}
            hrefLang={l}
            lang={l}
            aria-label={localeNames[l]}
            aria-current={l === lang ? "true" : undefined}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${l};path=/;max-age=31536000;samesite=lax`;
            }}
            className={`inline-flex min-h-10 min-w-7 items-center justify-center transition-opacity ${l === lang ? "opacity-100 underline decoration-brass underline-offset-[0.45em]" : "opacity-60 hover:opacity-100"}`}
          >
            {l.toUpperCase()}
          </a>
        </span>
      ))}
    </nav>
  );
}
