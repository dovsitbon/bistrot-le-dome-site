import site from "@/data/site.json";
import { getDict, locales, type Locale } from "@/lib/i18n";
import { closures, weekHours } from "@/lib/hours";
import { CATEGORIES, subName } from "@/lib/carte";
import { pagePath, type PageId } from "@/lib/pages";

const BUSINESS = `${site.url}/#restaurant`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function menu(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Menu",
    "@id": `${site.url}${pagePath("carte", lang)}#menu`,
    name: d.pages.carte.title,
    inLanguage: lang,
    hasMenuSection: CATEGORIES.flatMap((c) =>
      c.sections.map((s) => ({
        "@type": "MenuSection",
        name: s[lang],
        hasMenuItem: s.items.map((it) => {
          const sub = subName(it, lang);
          const desc = [sub, it.d?.[lang]].filter(Boolean).join(" · ");
          return {
            "@type": "MenuItem",
            name: it.fr,
            ...(desc ? { description: desc } : {}),
            offers: it.p.map((p) => ({ "@type": "Offer", price: p.v.toFixed(2), priceCurrency: "EUR", ...(p.l ? { name: p.l } : {}) })),
            ...(it.veg ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
          };
        }),
      })),
    ),
  };
}

function business(lang: Locale) {
  const d = getDict(lang);
  return {
    "@type": "Restaurant",
    "@id": BUSINESS,
    name: site.fullName,
    alternateName: ["Le Dôme", "Restaurant Bistrot Le Dôme Paris 15"],
    description: d.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}/og.jpg`, `${site.url}/media/hero/facade-soir.jpg`, `${site.url}/media/salle/salle.jpg`],
    logo: `${site.url}/icon-512.png`,
    telephone: site.phoneIntl,
    email: site.email,
    priceRange: site.priceRange,
    servesCuisine: ["French", lang === "fr" ? "Cuisine française" : lang === "es" ? "Cocina francesa" : "French bistro"],
    address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressRegion: site.address.region, addressCountry: site.address.country },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: [
      ...weekHours().flatMap((slots, i) => slots.map(([opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAYS[i]}`, opens, closes }))),
      ...closures.map((c) => ({ "@type": "OpeningHoursSpecification", opens: "00:00", closes: "00:00", validFrom: c.from, validThrough: c.to })),
    ],
    // Note Google relevée à la main, avec sa date (data/site.json → rating.checked)
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.rating.value, reviewCount: site.rating.count, bestRating: 5, worstRating: 1, dateModified: site.rating.checked },
    sameAs: [site.instagram, site.mapsUrl],
    acceptsReservations: `${site.url}${pagePath("reserver", lang)}`,
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Visa, Mastercard, American Express, Ticket Restaurant",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Wheelchair accessible", value: true },
      { "@type": "LocationFeatureSpecification", name: "Terrace", value: true },
      { "@type": "LocationFeatureSpecification", name: "Bar", value: true },
    ],
    hasMenu: { "@id": `${site.url}${pagePath("carte", lang)}#menu` },
    potentialAction: { "@type": "ReserveAction", target: `${site.url}${pagePath("reserver", lang)}`, result: { "@type": "FoodEstablishmentReservation", name: d.nav.reserve } },
  };
}

const faq = (lang: Locale) => ({ "@type": "FAQPage", mainEntity: getDict(lang).faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });

/** Données structurées de l'accueil : restaurant (horaires, note Google datée), carte, FAQ. */
export function homeJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [{ "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.fullName, inLanguage: [...locales], publisher: { "@id": BUSINESS } }, business(lang), menu(lang), faq(lang)],
  };
}

/** Données structurées d'une page secondaire, plus fil d'Ariane. */
export function pageJsonLd(lang: Locale, id: PageId) {
  const d = getDict(lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      business(lang),
      ...(id === "carte" ? [menu(lang)] : []),
      ...(id === "groupes" ? [faq(lang)] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.fullName, item: `${site.url}/${lang}` },
          { "@type": "ListItem", position: 2, name: d.pages[id].title, item: `${site.url}${pagePath(id, lang)}` },
        ],
      },
    ],
  };
}
