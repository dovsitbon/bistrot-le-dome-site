import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/data/site.json";
import { getDict, isLocale, locales, ogLocale, type Dict, type Locale } from "@/lib/i18n";
import { pageJsonLd } from "@/lib/jsonld";
import { pageOfSlug, pagePath, PAGE_IDS, SLUGS, type PageId } from "@/lib/pages";
import { CarteFull, CarteNav } from "@/components/Carte";
import { Access, Faq, Groups } from "@/components/Sections";
import { BookingForm } from "@/components/BookingForm";
import { Pic } from "@/components/Pic";
import { Rating } from "@/components/Rating";
import { OpenStatus } from "@/components/OpenStatus";
import { HoursTable } from "@/components/HoursTable";
import { PhoneIcon } from "@/components/icons";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGE_IDS.map((id) => ({ lang, slug: SLUGS[id][lang] })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const id = pageOfSlug(slug, lang);
  if (!id) return {};
  const p = getDict(lang).pages[id];
  return {
    title: { absolute: p.metaTitle },
    description: p.metaDescription,
    alternates: {
      canonical: pagePath(id, lang),
      languages: { ...Object.fromEntries(locales.map((l) => [l, pagePath(id, l)])), "x-default": pagePath(id, "fr") },
    },
    openGraph: { type: "website", url: pagePath(id, lang), siteName: site.fullName, title: p.metaTitle, description: p.metaDescription, locale: ogLocale[lang], images: [{ url: "/og.jpg", width: 1200, height: 630 }] },
    ...(id === "legal" ? { robots: { index: false, follow: true } } : {}),
  };
}

function PageHead({ lang, d, id, children }: { lang: Locale; d: Dict; id: PageId; children?: React.ReactNode }) {
  const p = d.pages[id] as { h1: string; intro?: string; title: string };
  return (
    <header className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <nav aria-label={d.nav.breadcrumb} className="text-[0.875rem] text-muted">
        <Link href={`/${lang}`} className="hover:underline">
          {site.fullName}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{p.title}</span>
      </nav>
      <h1 className="display mt-4 max-w-4xl text-[2.75rem] md:text-[4.5rem]">{p.h1}</h1>
      {p.intro && <p className="lead mt-5 max-w-2xl">{p.intro}</p>}
      {children}
    </header>
  );
}

/** Pages « Restaurant Porte de Versailles » et « Restaurant près de Paris Expo » : texte utile, photos, accès. */
function SeoPage({ lang, d, id, photos }: { lang: Locale; d: Dict; id: "portedeversailles" | "parisexpo"; photos: string[] }) {
  const p = d.pages[id];
  return (
    <>
      <PageHead lang={lang} d={d} id={id}>
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.9375rem]">
          <Rating lang={lang} d={d} />
          <OpenStatus />
        </div>
      </PageHead>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="space-y-10">
          {p.sections.map((s) => (
            <section key={s.h}>
              <h2 className="display rule pt-3 text-[1.75rem] md:text-[2.25rem]">{s.h}</h2>
              {s.p.map((t) => (
                <p key={t} className="lead mt-3">
                  {t}
                </p>
              ))}
            </section>
          ))}
          <div className="flex flex-wrap gap-3">
            <Link href={pagePath("reserver", lang)} className="btn">
              {d.nav.reserve}
            </Link>
            <Link href={pagePath("carte", lang)} className="btn-line">
              {d.nav.seeMenu}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          {photos.map((src, i) => (
            <Pic key={src} src={src} d={d} sizes="(min-width: 1024px) 20vw, 45vw" className={i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-[4/5]"} />
          ))}
        </div>
      </div>
      <Access lang={lang} d={d} />
    </>
  );
}

function Legal({ d }: { d: Dict }) {
  const l = d.legal;
  const todo = <span className="text-bordeaux">{l.toFill}</span>;
  const rows: [string, React.ReactNode][] = [
    [l.editor, <>{site.legal.company}, {site.address.street}, {site.address.postalCode} {site.address.city} · {site.phone} · {site.email}</>],
    [l.siret, site.legal.siret || todo],
    [l.director, site.legal.director || todo],
    [l.host, site.legal.host],
    [l.photos, l.photosText],
    [l.map, l.mapText],
    [l.data, l.dataText],
  ];
  return (
    <dl className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      {rows.map(([k, v]) => (
        <div key={k} className="border-b border-line py-5">
          <dt className="font-medium">{k}</dt>
          <dd className="mt-1 text-muted">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function Page({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const id = pageOfSlug(slug, lang);
  if (!id) notFound();
  const d = getDict(lang);

  let body: React.ReactNode;
  if (id === "carte")
    body = (
      <>
        <PageHead lang={lang} d={d} id="carte" />
        <div className="mt-10">
          <CarteNav lang={lang} d={d} />
          <CarteFull lang={lang} d={d} />
        </div>
      </>
    );
  else if (id === "reserver")
    body = (
      <>
        <PageHead lang={lang} d={d} id="reserver">
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-[0.9375rem]">
            <Rating lang={lang} d={d} />
            <OpenStatus />
          </div>
        </PageHead>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
          <BookingForm kind="table" />
          <aside className="space-y-8 self-start">
            <div>
              <h2 className="rule pt-3 font-medium">{d.access.hoursTitle}</h2>
              <HoursTable lang={lang} d={d} className="mt-2" />
            </div>
            <a href={`tel:${site.phoneIntl}`} className="btn-line w-full">
              <PhoneIcon />
              {site.phone}
            </a>
            <p className="text-[0.9375rem] text-muted">
              {site.address.street}, {site.address.postalCode} {site.address.city}
            </p>
            <Link href={pagePath("groupes", lang)} className="link-line block text-[0.9375rem]">
              {d.form.groupTitle}
            </Link>
          </aside>
        </div>
      </>
    );
  else if (id === "groupes")
    body = (
      <>
        <PageHead lang={lang} d={d} id="groupes" />
        <div className="mt-12">
          <Groups lang={lang} d={d} withHeading={false} />
        </div>
        <Faq lang={lang} d={d} />
      </>
    );
  else if (id === "portedeversailles") body = <SeoPage lang={lang} d={d} id="portedeversailles" photos={["/media/facade/facade.jpg", "/media/plats/escargots.jpg", "/media/desserts/tiramisu.jpg"]} />;
  else if (id === "parisexpo") body = <SeoPage lang={lang} d={d} id="parisexpo" photos={["/media/salle/salle.jpg", "/media/plats/burger-du-dome.jpg", "/media/bar/grimbergen.jpg"]} />;
  else
    body = (
      <>
        <PageHead lang={lang} d={d} id="legal" />
        <Legal d={d} />
      </>
    );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(lang, id)) }} />
      {body}
    </>
  );
}
