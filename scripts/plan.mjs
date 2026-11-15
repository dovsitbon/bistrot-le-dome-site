// Plan du quartier pour la section Accès : tuiles OpenStreetMap assemblées une fois, teintées à la charte,
// avec le repère du Dôme. Servi depuis le site : aucune carte tierce chargée par les visiteurs.
//   node scripts/plan.mjs   (à relancer seulement si l'adresse change)
// → public/media/plan/plan.jpg et assets/plan/plan.jpg. Mention obligatoire : « © les contributeurs d'OpenStreetMap ».
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ROOT, C, dome } from "./draw.mjs";

const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
const Z = 17;
const W = 1400;
const H = 1000;
// Centre un peu au sud du restaurant, pour montrer aussi le nord du Parc des Expositions et la Porte de Versailles
const center = { lat: site.geo.lat - 0.0016, lng: site.geo.lng - 0.0004 };

const px = (lat, lng) => {
  const n = 2 ** Z * 256;
  const x = ((lng + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return { x, y };
};

const c = px(center.lat, center.lng);
const x0 = c.x - W / 2;
const y0 = c.y - H / 2;
const tx0 = Math.floor(x0 / 256);
const ty0 = Math.floor(y0 / 256);
const tx1 = Math.floor((x0 + W) / 256);
const ty1 = Math.floor((y0 + H) / 256);

const tiles = [];
for (let tx = tx0; tx <= tx1; tx++)
  for (let ty = ty0; ty <= ty1; ty++) {
    const r = await fetch(`https://tile.openstreetmap.org/${Z}/${tx}/${ty}.png`, { headers: { "User-Agent": "bistrot-le-dome-site/1.0 (static map, one-off build)" } });
    if (!r.ok) throw new Error(`tuile ${tx}/${ty} : ${r.status}`);
    tiles.push({ input: Buffer.from(await r.arrayBuffer()), left: (tx - tx0) * 256, top: (ty - ty0) * 256 });
  }

const big = await sharp({ create: { width: (tx1 - tx0 + 1) * 256, height: (ty1 - ty0 + 1) * 256, channels: 3, background: "#fff" } })
  .composite(tiles)
  .png()
  .toBuffer();

// Teinte : niveaux de gris, puis du bleu nuit (traits) au crème (fond)
const gray = await sharp(big)
  .extract({ left: Math.round(x0 - tx0 * 256), top: Math.round(y0 - ty0 * 256), width: W, height: H })
  .grayscale()
  .linear(1.35, -60)
  .toBuffer();
const tinted = await sharp(gray).tint(C.paperDeep).modulate({ saturation: 0.55 }).toBuffer();

const m = px(site.geo.lat, site.geo.lng);
const mx = m.x - x0;
const my = m.y - y0;
const marker = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<circle cx="${mx}" cy="${my}" r="46" fill="${C.bordeaux}" fill-opacity="0.12"/>
<path d="M${mx} ${my + 2} l-22 -38 a26 26 0 1 1 44 0 Z" fill="${C.bordeaux}"/>
${dome(mx, my - 58, 34, { stroke: C.card, width: 2.4 })}
</svg>`);

const out = await sharp(tinted).composite([{ input: marker }]).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
for (const dir of ["assets/plan", "public/media/plan"]) {
  await mkdir(path.join(ROOT, dir), { recursive: true });
  await writeFile(path.join(ROOT, dir, "plan.jpg"), out);
}
console.log(`plan.jpg écrit (${W} × ${H}, zoom ${Z}, ${tiles.length} tuiles OSM)`);
