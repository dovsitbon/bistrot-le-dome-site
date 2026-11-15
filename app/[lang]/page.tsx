import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { homeJsonLd } from "@/lib/jsonld";
import { Access, Blocks, CarteTeaser, Daily, Faq, Groups, Hero, Reviews, Services, Tiles } from "@/components/Sections";

// Revalidation horaire : le plat du jour et les annonces datées suivent sans redéploiement manuel.
export const revalidate = 3600;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(lang)) }} />
      <Hero lang={lang} d={d} />
      <Tiles lang={lang} d={d} />
      <Services lang={lang} d={d} />
      <Daily lang={lang} d={d} />
      <CarteTeaser lang={lang} d={d} />
      <Blocks lang={lang} d={d} />
      <Groups lang={lang} d={d} />
      <Reviews lang={lang} d={d} />
      <Access lang={lang} d={d} />
      <Faq lang={lang} d={d} />
    </>
  );
}
