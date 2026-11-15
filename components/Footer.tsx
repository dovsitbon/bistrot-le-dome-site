import Link from "next/link";
import site from "@/data/site.json";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";
import { Logo } from "@/components/Logo";
import { Dome } from "@/components/Drawings";
import { HoursTable } from "@/components/HoursTable";
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/icons";

export function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const links = [
    { href: pagePath("carte", lang), label: d.nav.carte },
    { href: pagePath("reserver", lang), label: d.nav.reserve },
    { href: pagePath("groupes", lang), label: d.pages.groupes.title },
    { href: pagePath("portedeversailles", lang), label: d.pages.portedeversailles.title },
    { href: pagePath("parisexpo", lang), label: d.pages.parisexpo.title },
    { href: pagePath("legal", lang), label: d.footer.legal },
  ];
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-10 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8 md:pt-20">
        <div>
          <Logo className="h-14 w-auto text-paper" title={site.fullName} />
          <p className="mt-5 max-w-xs text-[0.9375rem] text-paper/75">{d.footer.tagline}</p>
          <Dome className="mt-6 h-9 w-9 text-brass" strokeWidth={1.1} />
        </div>
        <div>
          <h2 className="display text-[1.125rem] text-[#d7b57a]">{d.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-[0.9375rem]">
            <li>
              <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2.5 hover:underline">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${site.phoneIntl}`} className="inline-flex items-center gap-2.5 tabular-nums hover:underline">
                <PhoneIcon className="h-4 w-4" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 hover:underline">
                <MailIcon className="h-4 w-4" />
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:underline">
                <InstagramIcon className="h-4 w-4" />
                {site.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="display text-[1.125rem] text-[#d7b57a]">{d.footer.hours}</h2>
          <HoursTable lang={lang} d={d} className="mt-2 text-paper/90" />
        </div>
        <nav aria-label={d.footer.nav}>
          <h2 className="display text-[1.125rem] text-[#d7b57a]">{d.footer.nav}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t border-paper/15 px-5 py-6 text-[0.8125rem] text-paper/70 md:px-8">{fill(d.footer.rights, { year: new Date().getFullYear() })}</div>
    </footer>
  );
}
