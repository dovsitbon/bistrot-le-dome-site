"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import site from "@/data/site.json";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { CloseIcon, MenuIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { fill } from "@/lib/i18n";
import { pagePath } from "@/lib/pages";

export function useNavLinks() {
  const { lang, d } = useLocale();
  const home = `/${lang}`;
  return [
    { href: pagePath("carte", lang), label: d.nav.carte },
    { href: `${home}#menu-du-jour`, label: d.nav.daily },
    { href: pagePath("groupes", lang), label: d.nav.groupes },
    { href: `${home}#acces`, label: d.nav.acces },
    { href: `${home}#infos`, label: d.nav.infos },
    // Bon cadeau : prévu, affiché seulement quand data/site.json → giftCard.enabled passe à true
    ...(site.giftCard.enabled ? [{ href: `${home}#bon-cadeau`, label: d.nav.giftCard }] : []),
  ];
}

export function Header() {
  const { lang, d } = useLocale();
  const links = useNavLinks();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const home = `/${lang}`;
  const reserve = pagePath("reserver", lang);
  const tel = `tel:${site.phoneIntl}`;

  return (
    <>
      <header className={`sticky top-0 z-50 border-b bg-paper/95 backdrop-blur-sm transition-colors duration-300 ${scrolled ? "border-line" : "border-transparent"}`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:bg-card focus:px-4 focus:py-2">
          {d.nav.skip}
        </a>
        <div className="flex h-16 items-center gap-3 px-4 md:h-[4.75rem] md:px-6 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:px-8">
          <nav aria-label={d.nav.main} className="hidden items-center gap-6 text-[0.9375rem] font-medium xl:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-2 whitespace-nowrap decoration-brass decoration-1 underline-offset-[0.5em] hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={home} aria-label={`${site.fullName}, ${d.nav.home}`} className="me-auto text-navy xl:me-0">
            <Logo className="h-10 w-auto md:h-12" />
          </Link>
          <div className="flex items-center gap-1 md:gap-4 xl:justify-end">
            <LangSwitch lang={lang} label={d.nav.lang} className="hidden md:flex" />
            <a href={tel} className="hidden items-center gap-2 py-2 text-[0.9375rem] font-medium whitespace-nowrap tabular-nums hover:text-bordeaux lg:inline-flex" aria-label={fill(d.nav.callAria, { phone: site.phone })}>
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
            <a href={tel} className="flex h-11 w-11 items-center justify-center lg:hidden" aria-label={fill(d.nav.callAria, { phone: site.phone })}>
              <PhoneIcon className="h-5 w-5" />
            </a>
            <Link href={reserve} className="btn !min-h-11 !px-5 max-md:hidden">
              {d.nav.reserve}
            </Link>
            <button type="button" className="flex h-11 w-11 items-center justify-center xl:hidden" aria-label={d.nav.openMenu} aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen(true)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="menu-mobile" role="dialog" aria-modal="true" aria-label={d.nav.main} className="fade-in fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-paper px-5 pb-8">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Logo className="h-10 w-auto text-navy" />
            <button type="button" autoFocus className="flex h-11 w-11 items-center justify-center" aria-label={d.nav.close} onClick={() => setOpen(false)}>
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <nav aria-label={d.nav.main} className="rule mt-4 flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="display border-b border-line py-4 text-[1.75rem]">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link href={reserve} onClick={() => setOpen(false)} className="btn col-span-2">
              {d.nav.reserve}
            </Link>
            <a href={tel} className="btn-line">
              <PhoneIcon />
              {d.nav.call}
            </a>
            <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
              <PinIcon />
              {d.nav.directions}
            </a>
          </div>
          <div className="mt-auto flex items-center justify-between pt-8">
            <a href={tel} className="inline-flex min-h-11 items-center font-medium tabular-nums">
              {site.phone}
            </a>
            <LangSwitch lang={lang} label={d.nav.lang} />
          </div>
        </div>
      )}
    </>
  );
}

/** Barre fixée en bas de l'écran sur mobile : « Réserver une table » toujours sous le pouce, et « Appeler » à côté. */
export function MobileBar() {
  const { lang, d } = useLocale();
  const pathname = usePathname() ?? "";
  const onBooking = pathname.startsWith(pagePath("reserver", lang));
  return (
    <>
      <div className="h-[4.5rem] md:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-paper/97 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <a href={`tel:${site.phoneIntl}`} className="btn-line !px-4" aria-label={fill(d.nav.callAria, { phone: site.phone })}>
          <PhoneIcon />
          {d.nav.call}
        </a>
        {onBooking ? (
          <Link href={pagePath("carte", lang)} className="btn flex-1">
            {d.nav.seeMenu}
          </Link>
        ) : (
          <Link href={pagePath("reserver", lang)} className="btn flex-1">
            {d.nav.reserve}
          </Link>
        )}
      </div>
    </>
  );
}
