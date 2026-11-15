// Outils de dessin partagés par les scripts (logo, image de partage, affichette) :
// texte converti en tracés (aucune police à installer), le logo du Dôme et la coupole au trait.
import { readFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";

export const ROOT = path.resolve(import.meta.dirname, "..");

// Charte tirée de ses photos (même valeurs que app/globals.css).
export const C = {
  paper: "#F5EFE3",
  paperDeep: "#ECE3D2",
  card: "#FBF8F2",
  ink: "#1E1B18",
  muted: "#574E46",
  navy: "#263E57",
  navyDeep: "#1A2B3D",
  bordeaux: "#6E1F27",
  brass: "#B08D57",
  brassInk: "#7A5A2B",
};

async function load(file) {
  const buf = await readFile(path.join(ROOT, "node_modules", file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const fonts = {
  display: await load("@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff"),
  displayBold: await load("@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff"),
  text: await load("@fontsource/jost/files/jost-latin-400-normal.woff"),
  medium: await load("@fontsource/jost/files/jost-latin-500-normal.woff"),
};

/** Largeur d'un texte, interlettrage compris (tracking en em). */
export function width(font, text, size, tracking = 0) {
  return font.getAdvanceWidth(text, size) + tracking * size * (text.length - 1);
}

/** Texte en tracés SVG. anchor : start | middle | end. tracking en em. */
export function text(font, str, x, y, size, { fill = C.ink, anchor = "start", tracking = 0 } = {}) {
  const w = width(font, str, size, tracking);
  let cursor = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  let d = "";
  for (const ch of str) {
    d += font.getPath(ch, cursor, y, size).toPathData(2);
    cursor += font.getAdvanceWidth(ch, size) + tracking * size;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

/** Tracés du vrai logo (lettrage « BISTROT LE DÔME » à ombre portée), extraits de son fichier d'origine. */
export async function logoPaths() {
  const raw = await readFile(path.join(ROOT, "assets/logo/logo-origine.svg"), "utf8");
  const viewBox = raw.match(/viewBox="([^"]+)"/)[1];
  const paths = [...raw.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  return { viewBox, paths };
}

/** Le logo placé en (x, y), largeur w. */
export async function logo(x, y, w, { fill = C.navy } = {}) {
  const { viewBox, paths } = await logoPaths();
  const [, , vw] = viewBox.split(/\s+/).map(Number);
  const s = w / vw;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" fill-rule="evenodd">${paths.map((d) => `<path d="${d}"/>`).join("")}</g>`;
}

// Coupole au trait (mêmes tracés que components/Drawings.tsx → DOME), boîte 48 × 48.
export const DOME = [
  "M7 40h34M10 40v-5h28v5",
  "M11 35c0-11 5.8-18.5 13-18.5S37 24 37 35",
  "M24 16.5V35M17.6 19.6C16 23.6 15.4 29 15.5 35M30.4 19.6C32 23.6 32.6 29 32.5 35",
  "M21.5 16.5v-4h5v4M24 12.5V7.5",
];

/** Coupole centrée en (cx, cy), largeur w. */
export function dome(cx, cy, w, { stroke = C.brass, width = 1.3 } = {}) {
  const s = w / 48;
  return `<g transform="translate(${cx - 24 * s} ${cy - 24 * s}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${DOME.map((d) => `<path d="${d}"/>`).join("")}<circle cx="24" cy="6" r="1.2" fill="${stroke}" stroke="none"/></g>`;
}
