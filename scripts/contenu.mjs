// CONTENU.md : tous les textes du site et la carte, en français (avec l'anglais et l'espagnol), pour relecture.
//   npm run contenu
// Le fichier est régénéré à partir de locales/*.json et de data/*.json : corrigez les textes dans ces fichiers,
// pas dans CONTENU.md.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROOT } from "./draw.mjs";

const json = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const [fr, en, es, carte, jour, site, horaires, annonces] = await Promise.all(
  ["locales/fr.json", "locales/en.json", "locales/es.json", "data/carte.json", "data/menu-du-jour.json", "data/site.json", "data/horaires.json", "data/annonces.json"].map(json),
);

const out = [];
const h = (n, t) => out.push("", `${"#".repeat(n)} ${t}`, "");
const tri = (label, a, b, c) => out.push(`- **${label}**`, `  - FR : ${a}`, `  - EN : ${b}`, `  - ES : ${c}`);
const eur = (n) => `${n.toFixed(2).replace(".", ",")} €`;

out.push(
  "# Bistrot Le Dôme : contenu du site",
  "",
  "Tous les textes et la carte, pour validation. Ce qui est marqué **À CONFIRMER** ou **À REMPLIR** est listé dans INFOS-A-DEMANDER.md.",
  "",
  `Sources (relevé du ${carte.checked}) : sa carte QR WiiC (carte complète et prix), sa fiche Google (${site.rating.value}/5, ${site.rating.count} avis, thèmes des avis, description du propriétaire), son ancien site CentralApp (bistrotledome.fr : moyens de paiement, accès PMR, happy hour, groupes et privatisation) et son Instagram ${site.instagramHandle}.`,
);

h(2, "Titre du hero : trois options");
out.push(
  "1. **La vraie cuisine de bistrot** (retenue : courte, elle dit tout, et elle laisse la photo de la façade parler)",
  "2. Le goût de Paris, à deux pas des salons",
  "3. Bourguignon, escargots et crème brûlée",
);

h(2, "Référencement");
tri("Titre de l'accueil", fr.meta.title, en.meta.title, es.meta.title);
tri("Description", fr.meta.description, en.meta.description, es.meta.description);
for (const id of Object.keys(fr.pages)) tri(`Page « ${fr.pages[id].title} »`, `${fr.pages[id].metaTitle} — ${fr.pages[id].metaDescription}`, `${en.pages[id].metaTitle} — ${en.pages[id].metaDescription}`, `${es.pages[id].metaTitle} — ${es.pages[id].metaDescription}`);

h(2, "Bandeau d'infos (refermable, défile toutes les 6 s)");
out.push(`1. Le plat du jour (data/menu-du-jour.json) : « ${fr.announce.daily.replace("{dish}", jour.items[0]?.fr.name ?? "").replace("{price}", jour.items[0]?.price ? eur(jour.items[0].price) : "")} »`);
out.push(`2. Les annonces datées de data/annonces.json (salon en cours, fermeture, soirée) : aucune pour l'instant.`);
tri("3. Message salons", annonces.salonDefault.fr, annonces.salonDefault.en, annonces.salonDefault.es);

h(2, "Hero");
for (const k of ["eyebrow", "title", "sub"]) tri(k, fr.hero[k], en.hero[k], es.hero[k]);
out.push("", `Boutons : « ${fr.nav.reserve} » et « ${fr.nav.seeMenu} ». Dessous : ${site.rating.value}/5 sur Google (près de ${Math.ceil(site.rating.count / 100) * 100} avis) et le statut « Ouvert maintenant / Fermé » calculé en direct.`);

h(2, "Tuiles et services");
for (const k of Object.keys(fr.tiles.items)) tri("Tuile", `${fr.tiles.items[k].label} — ${fr.tiles.items[k].sub}`, `${en.tiles.items[k].label} — ${en.tiles.items[k].sub}`, `${es.tiles.items[k].label} — ${es.tiles.items[k].sub}`);
fr.services.items.forEach((s, i) => tri("Service", `${s.title} — ${s.text}`, `${en.services.items[i].title} — ${en.services.items[i].text}`, `${es.services.items[i].title} — ${es.services.items[i].text}`));

h(2, "Le plat du jour (data/menu-du-jour.json)");
out.push(`Mis à jour le ${jour.updated}. Pour le changer : modifier le nom, la garniture et le prix dans data/menu-du-jour.json, puis pousser sur GitHub.`);
for (const it of jour.items) out.push(`- **${it.fr.name}**, ${it.fr.desc} : ${it.price ? eur(it.price) : "**À REMPLIR**"} (EN : ${it.en.name} · ES : ${it.es.name})`);
tri("Texte", fr.daily.intro, en.daily.intro, es.daily.intro);

h(2, "La carte (data/carte.json)");
out.push(`Relevée le ${carte.checked} sur la carte QR. Le nom français reste le titre dans les trois langues ; la traduction s'affiche dessous en anglais et en espagnol. Les prix sont ceux de la carte QR. Quelques noms de vins étaient mal saisis sur la carte QR et ont été corrigés au mieux : **à vérifier** (Pauillac, Margaux, Edmond de Rothschild, Saint-Estèphe).`);
for (const c of carte.categories) {
  h(3, `${c.fr} / ${c.en} / ${c.es}`);
  for (const s of c.sections) {
    out.push("", `**${s.fr}**${s.note ? ` (${s.note.fr})` : ""}`, "", "| Plat | Anglais | Espagnol | Description | Prix |", "|---|---|---|---|---|");
    for (const it of s.items) {
      const tags = [it.sig && "grand classique", it.veg && "végétarien"].filter(Boolean).join(", ");
      const prix = it.p.map((p) => `${p.l ? `${p.l} ` : ""}${eur(p.v)}`).join(" / ");
      out.push(`| ${it.fr}${tags ? ` _(${tags})_` : ""} | ${it.en ?? ""} | ${it.es ?? ""} | ${it.d?.fr ?? ""} | ${prix} |`);
    }
  }
}

h(2, "Les trois blocs");
for (const k of Object.keys(fr.blocks)) tri(fr.blocks[k].title, `${fr.blocks[k].text} [bouton : ${fr.blocks[k].cta}]`, `${en.blocks[k].title} — ${en.blocks[k].text}`, `${es.blocks[k].title} — ${es.blocks[k].text}`);

h(2, "Groupes et entreprises");
tri("Titre", fr.groups.title, en.groups.title, es.groups.title);
tri("Introduction", fr.groups.intro, en.groups.intro, es.groups.intro);
fr.groups.kinds.forEach((k, i) => tri(k.title, k.text, `${en.groups.kinds[i].title} — ${en.groups.kinds[i].text}`, `${es.groups.kinds[i].title} — ${es.groups.kinds[i].text}`));
out.push("", `Formulaire groupes : date, nombre de personnes (${site.groups.minGuests} à ${site.groups.maxGuests}), entreprise ou salon (facultatif), budget par personne (facultatif), nom, téléphone, e-mail, message. **Capacité réelle à confirmer.**`);
out.push(`Formulaire réservation : date, service (déjeuner ${site.booking.lunch.join("–")} / dîner ${site.booking.dinner.join("–")}), heure (toutes les ${site.booking.step} min), personnes (1 à ${site.booking.maxGuests}), nom, téléphone, e-mail, message.`);
tri("Message de fin (e-mail branché)", fr.form.done.text, en.form.done.text, es.form.done.text);
tri("Message de fin (e-mail pas encore branché)", fr.form.done.noMail, en.form.done.noMail, es.form.done.noMail);

h(2, "Avis");
tri("Titre", fr.reviews.title, en.reviews.title, es.reviews.title);
out.push("", "Thèmes affichés (comptés sur la fiche Google) : " + site.rating.themes.map((t) => `${fr.reviews.themes[t.id]} (${t.count})`).join(", ") + ".");
out.push("", "Vrais avis clients : **À REMPLIR** dans data/avis.json, avec l'accord du restaurant. Aucun avis n'est inventé.");

h(2, "Infos pratiques");
out.push(`- Adresse : ${site.address.street}, ${site.address.postalCode} ${site.address.city}`, `- Téléphone : ${site.phone} (fixe : pas de WhatsApp tant qu'il n'y a pas de portable)`, `- E-mail : ${site.email} (affiché sur sa carte QR)`, `- Paiement : ${fr.access.payment}`, "- Horaires (**À CONFIRMER**) :");
fr.infos.days.forEach((d, i) => out.push(`  - ${d} : ${(horaires.week[String(i + 1)] ?? []).map(([a, b]) => `${a} – ${b}`).join(", ") || "fermé"}`));
out.push(`- Happy hour : ${horaires.happyHour.from} – ${horaires.happyHour.to}, du lundi au samedi (**à confirmer**)`);
out.push(`- À pied : boulevard Lefebvre (face aux pavillons de Paris Expo) ${site.walk.expoEdge} min, entrée principale ${site.walk.expoMain} min, métro Porte de Versailles ${site.walk.metroPdV} min, métro Convention ${site.walk.metroConvention} min (calculés sur OpenStreetMap). Le brief disait 3 minutes : la distance mesurée est de 5 minutes, c'est ce que dit le site.`);

h(2, "FAQ");
fr.faq.items.forEach((f, i) => tri(f.q, f.a, `${en.faq.items[i].q} — ${en.faq.items[i].a}`, `${es.faq.items[i].q} — ${es.faq.items[i].a}`));

h(2, "Pages « Restaurant Porte de Versailles » et « Restaurant près de Paris Expo »");
for (const id of ["portedeversailles", "parisexpo"]) {
  h(3, fr.pages[id].h1);
  tri("Introduction", fr.pages[id].intro, en.pages[id].intro, es.pages[id].intro);
  fr.pages[id].sections.forEach((s, i) => tri(s.h, s.p.join(" "), `${en.pages[id].sections[i].h} — ${en.pages[id].sections[i].p.join(" ")}`, `${es.pages[id].sections[i].h} — ${es.pages[id].sections[i].p.join(" ")}`));
}

await writeFile(path.join(ROOT, "CONTENU.md"), out.join("\n") + "\n");
console.log(`CONTENU.md écrit (${out.length} lignes)`);
