// Affichette A5 à poser sur les tables (elle peut remplacer la carte QR actuelle) et en vitrine,
// avec un QR code vers la carte du site.
//   npm run affichette
// → print/affichette-a5.pdf (148 × 210 mm, 300 dpi) et print/affichette-a5.png (aperçu).
// L'adresse du QR code vient de data/site.json → url (+ /fr/la-carte) : relancez le script si le nom de domaine change.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import { ROOT, C, fonts, text, logo, dome } from "./draw.mjs";

const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
const target = `${site.url}/fr/la-carte`;
const W = 1748;
const H = 2480;
const cx = W / 2;

// QR code dessiné en carrés (correction élevée : il reste lisible même un peu taché)
const qr = QRCode.create(target, { errorCorrectionLevel: "H" });
const n = qr.modules.size;
const QR = 560;
const cell = QR / n;
const qx = cx - QR / 2;
const qy = 1420;
let squares = "";
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) squares += `<rect x="${(qx + c * cell).toFixed(2)}" y="${(qy + r * cell).toFixed(2)}" width="${(cell + 0.5).toFixed(2)}" height="${(cell + 0.5).toFixed(2)}"/>`;

const host = target.replace(/^https?:\/\//, "");
const M = 70; // marge du double filet
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<rect x="${M}" y="${M}" width="${W - 2 * M}" height="${H - 2 * M}" fill="none" stroke="${C.ink}" stroke-width="4"/>
<rect x="${M + 16}" y="${M + 16}" width="${W - 2 * M - 32}" height="${H - 2 * M - 32}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>
${dome(cx, 300, 190)}
${await logo(cx - 560, 420, 1120)}
${text(fonts.medium, "BISTROT FRANÇAIS  ·  PORTE DE VERSAILLES  ·  PARIS 15", cx, 1000, 34, { anchor: "middle", fill: C.brassInk, tracking: 0.12 })}
${text(fonts.display, "La carte est ici", cx, 1180, 104, { anchor: "middle" })}
${text(fonts.text, "Scannez pour la carte, les prix et le plat du jour", cx, 1270, 42, { anchor: "middle", fill: C.muted })}
${text(fonts.text, "Menu in English  ·  Carta en español", cx, 1330, 38, { anchor: "middle", fill: C.muted })}
<rect x="${qx - 44}" y="${qy - 44}" width="${QR + 88}" height="${QR + 88}" fill="#FFFFFF" stroke="${C.line ?? "#D9CCB4"}" stroke-width="2"/>
<g fill="${C.navyDeep}">${squares}</g>
${text(fonts.medium, host, cx, qy + QR + 130, 38, { anchor: "middle", fill: C.bordeaux })}
${text(fonts.text, "Réservation  ·  09 87 76 60 20", cx, qy + QR + 220, 46, { anchor: "middle", fill: C.ink })}
${text(fonts.text, "6 rue du Hameau, 75015 Paris", cx, qy + QR + 290, 38, { anchor: "middle", fill: C.muted })}
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await mkdir(path.join(ROOT, "print"), { recursive: true });
await sharp(png).resize({ width: 874 }).png().toFile(path.join(ROOT, "print/affichette-a5.png"));

const pdf = await PDFDocument.create();
pdf.setTitle("Bistrot Le Dôme, affichette A5");
const page = pdf.addPage([419.53, 595.28]); // A5 en points
const jpg = await pdf.embedJpg(await sharp(png).jpeg({ quality: 94 }).toBuffer());
page.drawImage(jpg, { x: 0, y: 0, width: 419.53, height: 595.28 });
await writeFile(path.join(ROOT, "print/affichette-a5.pdf"), await pdf.save());
console.log(`affichette A5 écrite, QR code → ${target}`);
