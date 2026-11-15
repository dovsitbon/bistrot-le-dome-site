import site from "@/data/site.json";
import type { Dict } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { formatDay, formatTime, isoDay } from "@/lib/format";
import { addDays, parisTime, slotsOn } from "@/lib/hours";

// Les deux demandes du site : une table (déjeuner ou dîner) et un groupe (entreprise, salon, privatisation).

export const SERVICES = ["lunch", "dinner"] as const;
export type Service = (typeof SERVICES)[number];

export type Booking = { kind: "table"; day: string; service: Service; time: string; guests: number; name: string; phone: string; email: string; message: string };
export type Group = { kind: "groupe"; day: string; guests: number; company: string; budget: string; name: string; phone: string; email: string; message: string };
export type Request = Booking | Group;

export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Heures proposées pour un service, comprises dans les horaires d'ouverture du jour choisi (data/site.json → booking). */
export function serviceTimes(service: Service, day: string, now?: Date): string[] {
  const [from, to] = site.booking[service] as [string, string];
  const open = day ? slotsOn(day) : [["00:00", "23:59"] as [string, string]];
  const out: string[] = [];
  // Aujourd'hui : seulement les heures à venir, au moins 30 minutes plus tard
  const earliest = now && day === isoDay(now) ? Math.ceil((toMin(parisTime(now)) + 30) / site.booking.step) * site.booking.step : 0;
  for (let t = Math.max(toMin(from), earliest); t <= toMin(to); t += site.booking.step) {
    const hhmm = toHHMM(t);
    // dernière arrivée une demi-heure avant la fermeture
    if (open.some(([a, b]) => toMin(a) <= t && t <= toMin(b) - 30)) out.push(hhmm);
  }
  return out;
}

export const bookingMaxDay = (now: Date) => addDays(isoDay(now), site.booking.daysAhead);
export const groupMaxDay = (now: Date) => addDays(isoDay(now), site.groups.daysAhead);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function contact(o: Record<string, unknown>) {
  return { name: str(o.name, 120), phone: str(o.phone, 30), email: str(o.email, 160), message: str(o.message, 1500) };
}
const contactOk = (c: { name: string; phone: string; email: string }) => !!c.name && isPhone(c.phone) && isEmail(c.email);

/** Vérifie une demande reçue par l'API (mêmes règles que le formulaire). */
export function parseRequest(v: unknown, now = new Date()): Request | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const day = str(o.day, 10);
  const guests = Math.round(Number(o.guests) || 0);
  const today = isoDay(now);
  if (!ISO.test(day) || day < today) return null;
  const c = contact(o);
  if (!contactOk(c)) return null;

  if (o.kind === "table") {
    const service: Service = o.service === "dinner" ? "dinner" : "lunch";
    const time = str(o.time, 5);
    if (day > bookingMaxDay(now) || !TIME.test(time) || !slotsOn(day).length) return null;
    if (guests < 1 || guests > site.booking.maxGuests) return null;
    return { kind: "table", day, service, time, guests, ...c };
  }
  if (o.kind === "groupe") {
    if (day > groupMaxDay(now) || guests < site.groups.minGuests || guests > site.groups.maxGuests) return null;
    return { kind: "groupe", day, guests, company: str(o.company, 120), budget: str(o.budget, 40), ...c };
  }
  return null;
}

const colon = (lang: Locale) => (lang === "fr" ? " :" : ":");

/** Le récapitulatif d'une demande, en texte (e-mail, écran de confirmation, e-mail de secours). */
export function requestText(r: Request, lang: Locale, d: Dict, withContact = true) {
  const m = d.form.mail;
  const c = colon(lang);
  const date = formatDay(r.day, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const lines =
    r.kind === "table"
      ? [`${m.date}${c} ${date}`, `${m.service}${c} ${d.form.services[r.service]}, ${formatTime(r.time, lang)}`, `${m.guests}${c} ${r.guests}`]
      : [`${m.date}${c} ${date}`, `${m.guests}${c} ${r.guests}`, r.company ? `${m.company}${c} ${r.company}` : "", r.budget ? `${m.budget}${c} ${r.budget}` : ""].filter(Boolean);
  const who = [`${m.name}${c} ${r.name}`, `${m.phone}${c} ${r.phone}`, `${m.email}${c} ${r.email}`];
  return [lines.join("\n"), withContact ? who.join("\n") : "", r.message ? `${m.message}${c}\n${r.message}` : ""].filter(Boolean).join("\n\n");
}

/** Lien e-mail de secours (tant que l'envoi automatique n'est pas branché) : la demande est déjà rédigée. */
export const mailtoLink = (subject: string, body: string) => (site.email ? `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : "");

/** Lien WhatsApp (vide tant que le restaurant n'a pas donné de portable : data/site.json → whatsapp). */
export const waLink = (text: string) => (site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : "");
