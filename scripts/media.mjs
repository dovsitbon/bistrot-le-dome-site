// Photos du site.
//   npm run media
//
// 1. Prépare pour le web toutes les photos de assets/<dossier>/ dans public/media/<dossier>/
//    (next/image sert ensuite AVIF/WebP à la bonne taille) et note leurs dimensions dans data/media-sizes.json.
// 2. Fabrique l'image de partage public/og.jpg (1200 × 630).
//
// Pour ajouter une photo prise sur place : déposez-la sous le nom attendu (voir assets/A-PHOTOGRAPHIER.md),
// par exemple assets/plats/bourguignon.jpg, puis relancez « npm run media » : le dessin qui tenait la place disparaît.
// assets/raw/ : images d'origine (fiche Google, ancien site), non publiées telles quelles.
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, C, fonts, text, logo, dome } from "./draw.mjs";

const CATS = ["hero", "plats", "desserts", "salle", "facade", "bar", "equipe", "plan"];

const sizes = {};
await rm(path.join(ROOT, "public/media"), { recursive: true, force: true });
for (const cat of CATS) {
  const dir = path.join(ROOT, "assets", cat);
  await mkdir(dir, { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  for (const f of (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const name = f.replace(/\.\w+$/, "").toLowerCase();
    const max = cat === "hero" ? 2400 : 2000;
    const info = await sharp(path.join(dir, f))
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
    sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
  }
}
await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");

// Image de partage : la façade à droite, le logo et l'essentiel à gauche
const right = await sharp(path.join(ROOT, "assets/hero/facade-soir.jpg")).rotate().resize(600, 630, { fit: "cover", position: "right" }).toBuffer();
const left = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="630">
<rect width="600" height="630" fill="${C.paper}"/>
${dome(300, 120, 92)}
${await logo(80, 190, 440)}
${text(fonts.display, "La vraie cuisine de bistrot", 300, 440, 38, { anchor: "middle" })}
${text(fonts.text, "Escargots · Bourguignon · Crème brûlée", 300, 494, 23, { anchor: "middle", fill: C.muted })}
${text(fonts.medium, "6 rue du Hameau · Paris 15 · Porte de Versailles", 300, 540, 20, { anchor: "middle", fill: C.brassInk })}
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: C.paper } })
  .composite([
    { input: left, left: 0, top: 0 },
    { input: right, left: 600, top: 0 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

console.log(`${Object.keys(sizes).length} photos prêtes, og.jpg écrit`);
