"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import annonces from "@/data/annonces.json";
import { CloseIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill, type Locale } from "@/lib/i18n";
import { isoDay, price } from "@/lib/format";
import { upcomingClosure } from "@/lib/hours";
import { DAILY } from "@/lib/carte";
import { pagePath } from "@/lib/pages";

type Msg = { id: string; text: string; href: string };
type Dated = { id: string; from?: string; to?: string } & Record<Locale, string>;

/**
 * Bandeau d'infos pratiques, refermable (mémorisé pour la session). Il fait défiler, toutes les 6 secondes :
 * 1. une fermeture en cours ou dans les 14 jours (data/horaires.json → closures) ;
 * 2. le plat du jour (data/menu-du-jour.json) ;
 * 3. les annonces datées en cours (data/annonces.json → items : salon, soirée…) ;
 * 4. le message « Salon en cours à Paris Expo ? Réservez votre table ».
 */
function messages(today: string, lang: Locale, dailyTpl: string): Msg[] {
  const home = `/${lang}`;
  const out: Msg[] = [];
  const closure = upcomingClosure(today);
  if (closure) out.push({ id: closure.id, text: closure[lang], href: `${home}#acces` });
  const dish = DAILY.items[0];
  if (dish) out.push({ id: `jour-${DAILY.updated}`, text: fill(dailyTpl, { dish: dish[lang].name, price: dish.price ? price(dish.price, lang) : "" }).replace(/ · $/, ""), href: `${home}#menu-du-jour` });
  for (const a of annonces.items as Dated[]) if ((!a.from || a.from <= today) && (!a.to || today <= a.to)) out.push({ id: a.id, text: a[lang], href: pagePath("reserver", lang) });
  out.push({ id: annonces.salonDefault.id, text: (annonces.salonDefault as Dated)[lang], href: pagePath("reserver", lang) });
  return out;
}

export function AnnounceBar() {
  const { lang, d } = useLocale();
  const [today, setToday] = useState(() => isoDay(new Date()));
  const list = useMemo(() => messages(today, lang, d.announce.daily), [today, lang, d.announce.daily]);
  const [i, setI] = useState(0);
  const [closed, setClosed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- date du navigateur, connue seulement après hydratation
    setToday(isoDay(new Date()));
    try {
      if (sessionStorage.getItem("dome-bandeau") === "1") setClosed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (paused || list.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length, paused]);

  if (closed) return null;
  const m = list[i % list.length];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} className="relative z-[51] flex min-h-10 items-center justify-center bg-navy-deep px-12 py-2 text-center text-[0.875rem] leading-snug text-paper md:text-[0.9375rem]">
      <p key={m.id} className="announce-msg" aria-live="off" suppressHydrationWarning>
        <Link href={m.href} className="decoration-brass underline-offset-4 hover:underline">
          {m.text}
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          setClosed(true);
          try {
            sessionStorage.setItem("dome-bandeau", "1");
          } catch {}
        }}
        className="absolute end-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center opacity-75 transition-opacity hover:opacity-100"
        aria-label={d.announce.close}
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
