import { Resend } from "resend";
import site from "@/data/site.json";
import { parseRequest, requestText } from "@/lib/requests";
import { fill, getDict, isLocale, type Locale } from "@/lib/i18n";

// Demande de réservation ou de groupe, envoyée par e-mail (Resend) :
//  1. notification au restaurant (en français, avec la langue du client) ;
//  2. confirmation au client, dans sa langue.
// Variables Vercel : RESEND_API_KEY, NOTIFY_EMAIL (adresse du restaurant), RESEND_FROM (domaine vérifié dans Resend,
// ex. « Bistrot Le Dôme <reservation@bistrotledome.fr> » ; sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte).
// Sans ces variables, la route répond { notified: false } : le site propose d'envoyer la demande par e-mail ou d'appeler.

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(title: string, text: string) {
  const body = escapeHtml(text)
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 18px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="background:#F5EFE3;padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#FBF8F2;border-top:4px double #1E1B18;padding:32px 28px;font-family:Helvetica,Arial,sans-serif;color:#1E1B18;font-size:15px;line-height:1.65">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#7A5A2B">Bistrot Le Dôme · Paris 15</p>
<h1 style="margin:0 0 24px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#263E57">${escapeHtml(title)}</h1>${body}
<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #D9CCB4;font-size:13px;color:#574E46">${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${site.phone}</p></div></div>`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  // Champ piège : rempli seulement par les robots
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true, notified: true, confirmed: false });
  const lang: Locale = typeof body.lang === "string" && isLocale(body.lang) ? body.lang : "fr";
  const r = parseRequest(body.data);
  if (!r) return Response.json({ ok: false }, { status: 400 });

  const fr = getDict("fr");
  const d = getDict(lang);
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return Response.json({ ok: true, notified: false, confirmed: false });

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM ?? "Bistrot Le Dôme <onboarding@resend.dev>";
  const isTable = r.kind === "table";
  const text = requestText(r, "fr", fr) + (lang === "fr" ? "" : `\n\n${fr.form.mail.lang} : ${lang.toUpperCase()}`);
  const subject = `${isTable ? fr.form.mail.subjectTable : fr.form.mail.subjectGroup} · ${r.name} · ${r.day}${isTable ? ` ${r.time}` : ""} · ${r.guests} pers.`;

  let notified = false;
  let confirmed = false;
  try {
    const res = await resend.emails.send({ from, to, replyTo: r.email, subject, html: html(isTable ? fr.form.mail.titleTable : fr.form.mail.titleGroup, text), text });
    notified = !res.error;
  } catch {}

  if (notified) {
    const m = d.form.mail;
    const ctext = `${fill(m.confirmIntro, { name: r.name })}\n\n${requestText(r, lang, d, false)}\n\n${m.confirmOutro}`;
    try {
      const res = await resend.emails.send({ from, to: r.email, replyTo: to, subject: m.confirmSubject, html: html(m.confirmSubject, ctext), text: ctext });
      confirmed = !res.error;
    } catch {}
  }
  return Response.json({ ok: true, notified, confirmed });
}
