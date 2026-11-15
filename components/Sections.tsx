import Image from "next/image";
import Link from "next/link";
import site from "@/data/site.json";
import avis from "@/data/avis.json";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { formatDay, formatTime, price } from "@/lib/format";
import { happyHour } from "@/lib/hours";
import { DAILY } from "@/lib/carte";
import { pagePath } from "@/lib/pages";
import { Pic, type SlotId } from "@/components/Pic";
import { firstImg } from "@/lib/media";

// Photo prise sur place si elle existe (assets/A-PHOTOGRAPHIER.md), sinon la photo actuelle
const pick = (...paths: string[]) => firstImg(paths)?.src ?? paths[paths.length - 1];
import { Rating, ratingValues } from "@/components/Rating";
import { OpenStatus } from "@/components/OpenStatus";
import { HoursTable } from "@/components/HoursTable";
import { Reveal } from "@/components/Reveal";
import { HeroImage } from "@/components/HeroImage";
import { BookingForm } from "@/components/BookingForm";
import { CartePreview } from "@/components/Carte";
import { Booking, Pavilion, TableGroup, Toque } from "@/components/Drawings";
import { ArrowIcon, PhoneIcon, PinIcon, PlusIcon } from "@/components/icons";

type S = { lang: Locale; d: Dict };

/** Titre de section : chapeau en italique (filet laiton), grand titre Playfair. */
export function Heading({ kicker, title, id, children, className = "", light = false }: { kicker: string; title: string; id: string; children?: React.ReactNode; className?: string; light?: boolean }) {
  return (
    <div className={className}>
      <p className={`kicker ${light ? "!text-[#d7b57a]" : ""}`}>{kicker}</p>
      <h2 id={id} className="display mt-3 max-w-3xl text-[2.375rem] md:text-[3.5rem]">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ——— 3. Hero ——— */
export function Hero({ lang, d }: S) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100svh-6.5rem)] items-end overflow-hidden bg-ink text-card md:min-h-[calc(100svh-7.25rem)]">
      <HeroImage>
        <Image src="/media/hero/facade-soir.jpg" alt={d.alt["facade-soir"]} fill priority fetchPriority="high" sizes="100vw" quality={80} className="object-cover object-[70%_center] md:object-center" />
      </HeroImage>
      {/* Voile sombre en bas, pour lire le texte sur la photo */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,18,16,0.88)_0%,rgba(20,18,16,0.55)_42%,rgba(20,18,16,0.08)_75%)]" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-10 md:px-8 md:pb-16">
        <p className="sign text-[#e2c99c]">{d.hero.eyebrow}</p>
        <h1 id="hero-title" className="display mt-4 max-w-[13ch] text-[3.25rem] text-card sm:text-[4.25rem] md:text-[5.75rem]">
          {d.hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-[1.125rem] leading-relaxed text-card/90 md:text-[1.25rem]">{d.hero.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={pagePath("reserver", lang)} className="btn">
            {d.nav.reserve}
          </Link>
          <Link href={pagePath("carte", lang)} className="btn-ghost">
            {d.nav.seeMenu}
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.9375rem] text-card/95">
          <Rating lang={lang} d={d} />
          <OpenStatus dark />
        </div>
      </div>
    </section>
  );
}

/* ——— 4. Tuiles de catégories ——— */
export function Tiles({ lang, d }: S) {
  const carte = pagePath("carte", lang);
  const t = d.tiles.items;
  const dish = DAILY.items[0];
  const tiles: { id: keyof typeof t; href: string; src?: string; slot?: SlotId }[] = [
    { id: "daily", href: `/${lang}#menu-du-jour` },
    { id: "entrees", href: `${carte}#entrees`, src: "/media/plats/escargots.jpg" },
    { id: "plats", href: `${carte}#plats`, src: pick("/media/plats/bourguignon.jpg", "/media/plats/dorade.jpg") },
    { id: "desserts", href: `${carte}#c-desserts`, src: pick("/media/desserts/creme-brulee.jpg", "/media/desserts/tiramisu.jpg") },
    { id: "vins", href: `${carte}#c-vins`, src: "/media/bar/tireuses.jpg" },
  ];
  return (
    <nav aria-label={d.tiles.label} className="mx-auto max-w-7xl py-10 md:px-8 md:py-14">
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0">
        {tiles.map((tile, i) => (
          <Reveal as="li" key={tile.id} delay={i * 0.05} className="w-[42vw] max-w-[13rem] shrink-0 snap-start md:w-auto md:max-w-none">
            <Link href={tile.href} className="group block">
              {tile.id === "daily" ? (
                <div className="flex aspect-[4/5] flex-col justify-between border-[6px] border-frame bg-slate p-3.5 text-chalk">
                  <span className="display text-[0.9375rem] italic opacity-80">{d.daily.slate}</span>
                  <span className="display text-[1.375rem] leading-tight">{dish ? dish[lang].name : "…"}</span>
                  {dish?.price && <span className="tabular-nums opacity-90">{price(dish.price, lang)}</span>}
                </div>
              ) : (
                <Pic src={tile.src ?? ""} slot={tile.slot} d={d} sizes="(min-width: 768px) 18vw, 42vw" className="aspect-[4/5]" />
              )}
              <p className="mt-3 flex items-center gap-2 text-[1.0625rem] font-medium">
                {t[tile.id].label}
                <ArrowIcon className="h-3.5 w-3.5 text-brass transition-transform group-hover:translate-x-1" />
              </p>
              <p className="text-[0.875rem] leading-snug text-muted">{t[tile.id].sub}</p>
            </Link>
          </Reveal>
        ))}
      </ul>
    </nav>
  );
}

/* ——— 5. Bande de services ——— */
export function Services({ d }: S) {
  const icons = { maison: Toque, expo: Pavilion, groupes: TableGroup, resa: Booking };
  return (
    <section aria-label={d.services.label} className="border-y border-line bg-card">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 px-5 py-10 md:grid-cols-4 md:gap-10 md:px-8 md:py-12">
        {d.services.items.map((s) => {
          const Icon = icons[s.id as keyof typeof icons];
          return (
            <li key={s.id}>
              <Icon className="h-10 w-10 text-brass" strokeWidth={1.1} />
              <h2 className="mt-3 text-[1.0625rem] leading-snug font-medium">{s.title}</h2>
              <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{fill(s.text, { phone: site.phone })}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ——— 6. Le plat du jour, sur une ardoise ——— */
export function Daily({ lang, d }: S) {
  return (
    <section id="menu-du-jour" aria-labelledby="daily-title" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16 md:px-8 md:py-24">
      <Heading kicker={d.daily.eyebrow} title={d.daily.title} id="daily-title">
        <p className="lead mt-4 max-w-md">{d.daily.intro}</p>
        <p className="mt-4 text-[0.875rem] text-muted">{fill(d.daily.updated, { date: formatDay(DAILY.updated, lang) })}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={pagePath("reserver", lang)} className="btn">
            {d.daily.cta}
          </Link>
          <a href={`tel:${site.phoneIntl}`} className="btn-line">
            <PhoneIcon />
            {site.phone}
          </a>
        </div>
      </Heading>
      <Reveal>
        {/* L'ardoise : cadre en bois, fond ardoise, écriture craie */}
        <div className="border-[10px] border-frame bg-slate px-6 py-9 text-chalk shadow-[0_18px_40px_-24px_rgba(30,27,24,0.6)] md:border-[14px] md:px-12 md:py-14">
          <p className="display text-center text-[1.25rem] italic opacity-80">{d.daily.slate}</p>
          <div className="mx-auto my-6 h-px w-16 bg-chalk/40" aria-hidden="true" />
          {DAILY.items.length ? (
            <ul className="space-y-7">
              {DAILY.items.map((it) => (
                <li key={it.id} className="text-center">
                  <p className="display text-[2.25rem] leading-tight md:text-[3rem]">{it[lang].name}</p>
                  {it[lang].desc && <p className="mt-2 text-[1.0625rem] opacity-85">{it[lang].desc}</p>}
                  {it.price && <p className="display mt-4 text-[1.75rem] tabular-nums">{price(it.price, lang)}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center opacity-85">{d.daily.empty}</p>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ——— 7. La carte (aperçu des grands classiques) ——— */
export function CarteTeaser({ lang, d }: S) {
  return (
    <section id="carte" aria-labelledby="carte-title" className="border-t border-line bg-card">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <Heading kicker={d.carte.eyebrow} title={d.carte.title} id="carte-title">
          <p className="lead mt-4 max-w-2xl">{d.carte.intro}</p>
        </Heading>
        <div className="mt-10">
          <CartePreview lang={lang} d={d} />
        </div>
      </div>
    </section>
  );
}

/* ——— 8. Trois blocs alternés : photo, texte court, un seul bouton ——— */
export function Blocks({ lang, d }: S) {
  const b = d.blocks;
  const rows = [
    { id: "classics", data: b.classics, src: "/media/facade/ardoises-bourguignon.jpg", href: pagePath("carte", lang), ratio: "aspect-[4/5]" },
    { id: "salons", data: b.salons, src: "/media/salle/salle.jpg", href: pagePath("groupes", lang), ratio: "aspect-[4/3]" },
    { id: "bistrot", data: b.bistrot, src: pick("/media/equipe/equipe.jpg", "/media/salle/tables.jpg"), href: `/${lang}#acces`, ratio: "aspect-[4/3]" },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-5 py-20 md:space-y-28 md:px-8 md:py-28">
      {rows.map((r, i) => (
        <section key={r.id} aria-labelledby={`b-${r.id}`} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
          <Reveal className={`md:col-span-7 ${i % 2 ? "md:order-2" : ""} ${r.id === "classics" ? "md:col-span-4 md:col-start-2" : ""}`}>
            <Pic src={r.src} d={d} sizes="(min-width: 768px) 55vw, 100vw" className={r.ratio} />
          </Reveal>
          <div className={`md:col-span-5 ${i % 2 ? "md:order-1" : ""} ${r.id === "classics" ? "md:col-span-5 md:col-start-7" : ""}`}>
            <p className="kicker">{r.data.eyebrow}</p>
            <h2 id={`b-${r.id}`} className="display mt-3 text-[2.125rem] md:text-[2.875rem]">
              {r.data.title}
            </h2>
            <p className="lead mt-4">{r.data.text}</p>
            <Link href={r.href} className="btn-line mt-7">
              {r.data.cta}
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ——— 9. Groupes et entreprises, avec formulaire ——— */
export function Groups({ lang, d, withHeading = true }: S & { withHeading?: boolean }) {
  return (
    <section id="groupes" aria-labelledby="groups-title" className="bg-navy-deep text-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          {withHeading ? (
            <Heading kicker={d.groups.eyebrow} title={d.groups.title} id="groups-title" light />
          ) : (
            <h2 id="groups-title" className="display text-[2.125rem] md:text-[2.75rem]">
              {d.groups.title}
            </h2>
          )}
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-card/85">{d.groups.intro}</p>
          <ul className="mt-8 space-y-6 border-t border-card/20 pt-6">
            {d.groups.kinds.map((k) => (
              <li key={k.title}>
                <h3 className="display text-[1.375rem]">{k.title}</h3>
                <p className="mt-1 text-[0.9375rem] text-card/80">{k.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.9375rem] text-card/80">
            {fill(d.groups.large, { max: site.groups.maxGuests, phone: "" })}
            <a href={`tel:${site.phoneIntl}`} className="font-medium whitespace-nowrap text-card underline decoration-brass underline-offset-4">
              {site.phone}
            </a>
          </p>
        </div>
        <div className="text-ink">
          <BookingForm kind="groupe" title={d.form.groupTitle} intro={d.form.groupIntro} />
        </div>
      </div>
    </section>
  );
}

/* ——— 10. Avis : note Google et thèmes cités. Aucun avis inventé. ——— */
export function Reviews({ lang, d }: S) {
  const v = ratingValues(lang);
  const max = Math.max(...site.rating.themes.map((t) => t.count));
  const items = avis.items as { author: string; date: string; text: string; source: string }[];
  return (
    <section id="avis" aria-labelledby="reviews-title" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <Heading kicker={d.reviews.eyebrow} title={fill(d.reviews.title, v)} id="reviews-title">
          <p className="lead mt-4 max-w-md">{d.reviews.text}</p>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-line mt-7">
            {d.reviews.readAll}
          </a>
          <p className="mt-4 text-[0.8125rem] text-muted">{fill(d.reviews.checked, { date: formatDay(site.rating.checked, lang, { day: "numeric", month: "long", year: "numeric" }) })}</p>
        </Heading>
        <ul className="rule self-start pt-2">
          {site.rating.themes.map((t) => (
            <li key={t.id} className="border-b border-line py-3.5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="display text-[1.25rem]">{d.reviews.themes[t.id as keyof Dict["reviews"]["themes"]]}</span>
                <span className="text-[0.875rem] text-muted tabular-nums">{fill(d.reviews.mentions, { count: t.count })}</span>
              </div>
              <div className="mt-2 h-[3px] bg-paper-deep" aria-hidden="true">
                <div className="h-full bg-brass" style={{ width: `${(t.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* À REMPLIR avec de vrais avis clients (data/avis.json), avec l'accord du restaurant. Aucun avis inventé. */}
      {items.length > 0 && (
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((r) => (
            <li key={r.author + r.date} className="border-t border-ink pt-5">
              <blockquote className="display text-[1.25rem] leading-snug italic">« {r.text} »</blockquote>
              <p className="mt-3 text-[0.875rem] text-muted">
                {r.author} · {r.source}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ——— 11. Accès : plan, transports, temps de marche, horaires ——— */
export function Access({ lang, d }: S) {
  const a = d.access;
  const w = site.walk;
  return (
    <section id="acces" aria-labelledby="access-title" className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <Heading kicker={a.eyebrow} title={a.title} id="access-title">
            <p className="lead mt-4 max-w-xl">{a.intro}</p>
          </Heading>
          <figure className="mt-8">
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="group block border border-line" aria-label={a.openMaps}>
              <Image src="/media/plan/plan.jpg" alt={a.mapAlt} width={1400} height={1000} sizes="(min-width: 1024px) 55vw, 100vw" quality={75} className="h-auto w-full" />
            </a>
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[0.8125rem] text-muted">
              <span>{a.mapCredit}</span>
              <span>{a.walkNote}</span>
            </figcaption>
          </figure>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn">
              <PinIcon />
              {d.nav.directions}
            </a>
            <a href={`tel:${site.phoneIntl}`} className="btn-line">
              <PhoneIcon />
              {site.phone}
            </a>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <h3 className="rule pt-3 text-[1.0625rem] font-medium">{a.walkTitle}</h3>
            <ul className="mt-3 space-y-2 text-[0.9375rem]">
              <li>{fill(a.walkEdge, { min: w.expoEdge })}</li>
              <li>{fill(a.walkMain, { min: w.expoMain })}</li>
            </ul>
          </div>
          <div>
            <h3 className="rule pt-3 text-[1.0625rem] font-medium">{a.transportTitle}</h3>
            <ul className="mt-3 space-y-2 text-[0.9375rem]">
              <li>{fill(a.metro, { min: w.metroPdV })}</li>
              <li>{fill(a.metro2, { min: w.metroConvention })}</li>
              <li>{a.tram}</li>
            </ul>
          </div>
          <div>
            <h3 className="rule pt-3 text-[1.0625rem] font-medium">{a.hoursTitle}</h3>
            <HoursTable lang={lang} d={d} className="mt-2" />
            <OpenStatus className="mt-3 text-[0.9375rem]" />
            <p className="mt-3 text-[0.9375rem] text-muted">{fill(a.happyHour, { from: formatTime(happyHour.from, lang), to: formatTime(happyHour.to, lang) })}</p>
          </div>
          <div>
            <h3 className="rule pt-3 text-[1.0625rem] font-medium">{a.practical}</h3>
            <ul className="mt-3 space-y-2 text-[0.9375rem]">
              <li>{a.payment}</li>
              <li>{a.pmr}</li>
              <li>{a.terrace}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— 12. FAQ ——— */
export function Faq({ d }: S) {
  return (
    <section id="infos" aria-labelledby="faq-title" className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
      <Heading kicker={d.faq.eyebrow} title={d.faq.title} id="faq-title" />
      <div className="rule mt-10">
        {d.faq.items.map((f) => (
          <details key={f.q} className="group border-b border-line">
            <summary className="flex min-h-14 items-center justify-between gap-6 py-4">
              <h3 className="text-[1.0625rem] font-medium">{f.q}</h3>
              <PlusIcon className="faq-plus h-4 w-4 shrink-0 text-brass-ink" />
            </summary>
            <p className="pb-5 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
