// Logo du Bistrot Le Dôme : son vrai lettrage « BISTROT LE DÔME » (capitales à ombre portée, bleu nuit),
// repris de son fichier vectoriel d'origine (assets/logo/logo-origine.svg) et nettoyé.
//   npm run logo
// → components/logo-paths.ts (le logo dans le site, à la couleur du texte), public/logo.svg (bleu nuit),
//   public/logo-clair.svg (crème, fonds sombres), app/icon.svg (favicon : la coupole), app/apple-icon.png, public/icon-512.png.
// Pour un nouveau logo : remplacez assets/logo/logo-origine.svg (un seul aplat, tracés « d ») et relancez.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, C, logoPaths, dome } from "./draw.mjs";

const { viewBox, paths } = await logoPaths();
const file = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="${fill}" fill-rule="evenodd">${paths.map((d) => `<path d="${d}"/>`).join("")}</g></svg>\n`;

await writeFile(path.join(ROOT, "public/logo.svg"), file(C.navy));
await writeFile(path.join(ROOT, "public/logo-clair.svg"), file(C.paper));
await writeFile(
  path.join(ROOT, "components/logo-paths.ts"),
  `// Généré par scripts/logo.mjs à partir de assets/logo/logo-origine.svg : ne pas modifier à la main.\nexport const LOGO_VIEWBOX = "${viewBox}";\nexport const LOGO_PATHS = ${JSON.stringify(paths)};\n`,
);

// Favicon : la coupole laiton sur le bleu nuit du store
const mark = (size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${C.navy}"/>${dome(size / 2, size / 2, size * 0.86, { stroke: "#D7B57A", width: 2.4 })}</svg>`;
await writeFile(path.join(ROOT, "app/icon.svg"), mark(48) + "\n");
await sharp(Buffer.from(mark(512))).resize(180, 180).png().toFile(path.join(ROOT, "app/apple-icon.png"));
await sharp(Buffer.from(mark(512))).png().toFile(path.join(ROOT, "public/icon-512.png"));

// Aperçu pour comparer avec l'original
await sharp(Buffer.from(file(C.navy)))
  .resize(1200)
  .flatten({ background: C.paper })
  .png()
  .toFile(path.join(ROOT, "assets/logo/logo-apercu.png"));
console.log(`logo : ${paths.length} tracés → logo.svg, logo-clair.svg, logo-paths.ts, icon.svg, apple-icon.png, icon-512.png`);
