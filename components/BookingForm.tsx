"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import site from "@/data/site.json";
import { useLocale } from "@/components/providers";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { fill } from "@/lib/i18n";
import { formatTime, isoDay } from "@/lib/format";
import { slotsOn } from "@/lib/hours";
import { pagePath } from "@/lib/pages";
import { bookingMaxDay, groupMaxDay, isEmail, isPhone, mailtoLink, requestText, serviceTimes, waLink, type Booking, type Group, type Request, type Service } from "@/lib/requests";

type Kind = "table" | "groupe";
type Fields = Omit<Booking, "kind"> & Pick<Group, "company" | "budget">;
type Errors = Partial<Record<keyof Fields, string>>;
type Done = { mode: "mail" | "nomail" | "wa"; text: string; subject: string };

const TEL = `tel:${site.phoneIntl}`;

/**
 * Formulaire de réservation (kind="table") ou de demande de groupe (kind="groupe").
 * 1. Si un portable WhatsApp est renseigné (data/site.json → whatsapp) : WhatsApp s'ouvre avec la demande.
 * 2. Sinon : /api/demande l'envoie par e-mail (Resend) au restaurant, avec une confirmation au client dans sa langue.
 * 3. Si l'envoi automatique n'est pas encore branché : la demande toute rédigée part par e-mail en un clic, ou on appelle.
 */
export function BookingForm({ kind, title, intro }: { kind: Kind; title?: string; intro?: ReactNode }) {
  const { lang, d } = useLocale();
  const f = d.form;
  const isTable = kind === "table";
  const min = isTable ? 1 : site.groups.minGuests;
  const max = isTable ? site.booking.maxGuests : site.groups.maxGuests;
  const [today, setToday] = useState("");
  const [v, setV] = useState<Fields>({ day: "", service: "lunch", time: "", guests: isTable ? 2 : 20, company: "", budget: "", name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    const t = isoDay(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- date du navigateur, connue seulement après hydratation
    setToday(t);
    setV((p) => (p.day ? p : { ...p, day: t }));
  }, []);

  const closedDay = isTable && !!v.day && slotsOn(v.day).length === 0;
  const times = useMemo(() => (isTable && v.day ? serviceTimes(v.service, v.day, new Date()) : []), [isTable, v.day, v.service]);
  // Garder une heure valide quand le jour ou le service change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l'heure dépend du jour et du service choisis
    if (isTable && !times.includes(v.time)) setV((p) => ({ ...p, time: times[Math.min(2, times.length - 1)] ?? "" }));
  }, [isTable, times, v.time]);

  const set = <K extends keyof Fields>(k: K, val: Fields[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const maxDay = isTable ? bookingMaxDay(new Date()) : groupMaxDay(new Date());
    if (!v.day || v.day < today || v.day > maxDay || closedDay) e.day = closedDay ? f.noSlot : f.errors.day;
    if (isTable && !v.time) e.time = f.errors.time;
    if (!(v.guests >= min && v.guests <= max)) e.guests = fill(f.errors.guests, { min, max });
    if (!v.name.trim()) e.name = f.errors.required;
    if (!isPhone(v.phone)) e.phone = v.phone.trim() ? f.errors.phone : f.errors.required;
    if (!isEmail(v.email)) e.email = v.email.trim() ? f.errors.email : f.errors.required;
    return e;
  };

  const request = (): Request =>
    isTable
      ? { kind: "table", day: v.day, service: v.service, time: v.time, guests: v.guests, name: v.name, phone: v.phone, email: v.email, message: v.message }
      : { kind: "groupe", day: v.day, guests: v.guests, company: v.company, budget: v.budget, name: v.name, phone: v.phone, email: v.email, message: v.message };

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFailed(false);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`${kind}-${first}`)?.focus();
      return;
    }
    const r = request();
    const subject = `${isTable ? f.mail.subjectTable : f.mail.subjectGroup} · ${r.name} · ${r.day}`;
    const text = `${isTable ? f.mail.titleTable : f.mail.titleGroup} · ${site.fullName}\n\n${requestText(r, lang, d)}`;
    if (site.whatsapp) {
      window.open(waLink(text), "_blank", "noopener");
      setDone({ mode: "wa", text, subject });
      return;
    }
    setSending(true);
    try {
      const website = (ev.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/demande", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang, data: r, website }) });
      const j = (await res.json()) as { ok: boolean; notified?: boolean };
      if (!j.ok) throw new Error();
      setDone({ mode: j.notified ? "mail" : "nomail", text, subject });
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  if (done)
    return (
      <div className="border border-line bg-card p-6 md:p-10" role="status">
        <h3 className="display text-[2rem]">{done.mode === "mail" ? f.done.title : f.done.titleReady}</h3>
        <p className="mt-3 max-w-xl text-muted">{done.mode === "mail" ? f.done.text : done.mode === "wa" ? f.done.wa : f.done.noMail}</p>
        <pre className="mt-6 max-h-72 overflow-auto bg-paper p-4 font-[family-name:var(--font-body)] text-[0.9375rem] whitespace-pre-wrap">{done.text}</pre>
        <div className="mt-6 flex flex-wrap gap-3">
          {done.mode === "nomail" && (
            <>
              <a href={mailtoLink(done.subject, done.text)} className="btn">
                <MailIcon />
                {f.done.mailCta}
              </a>
              <a href={TEL} className="btn-line">
                <PhoneIcon />
                {fill(f.done.callCta, { phone: site.phone })}
              </a>
            </>
          )}
          {done.mode === "wa" && (
            <a href={waLink(done.text)} target="_blank" rel="noopener noreferrer" className="btn">
              <WhatsAppIcon />
              {f.done.waCta}
            </a>
          )}
          <button type="button" className="btn-line" onClick={() => setDone(null)}>
            {f.done.again}
          </button>
        </div>
      </div>
    );

  const id = (k: keyof Fields) => `${kind}-${k}`;
  const err = (k: keyof Fields) =>
    errors[k] ? (
      <p id={`${id(k)}-err`} aria-live="polite" className="mt-1.5 text-[0.875rem] text-bordeaux">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Fields) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${id(k)}-err` : undefined });
  const opt = <span className="font-normal text-muted">({f.optional})</span>;

  return (
    <form onSubmit={submit} noValidate className="border border-line bg-card p-5 sm:p-6 md:p-10">
      {title && <h3 className="display text-[1.875rem] md:text-[2.25rem]">{title}</h3>}
      {intro && <p className="mt-2 max-w-xl text-muted">{intro}</p>}

      <div className={`mt-7 grid gap-5 ${isTable ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        <div>
          <label htmlFor={id("day")} className="label">
            {f.day}
          </label>
          <input id={id("day")} name="day" type="date" className="field" min={today || undefined} max={today ? (isTable ? bookingMaxDay(new Date()) : groupMaxDay(new Date())) : undefined} value={v.day} onChange={(e) => set("day", e.target.value)} required {...aria("day")} />
          {err("day")}
          {closedDay && !errors.day && <p className="mt-1.5 text-[0.875rem] text-bordeaux">{f.noSlot}</p>}
        </div>
        <div>
          <label htmlFor={id("guests")} className="label">
            {f.guests}
          </label>
          <input id={id("guests")} name="guests" type="number" inputMode="numeric" min={min} max={max} className="field tabular-nums" value={v.guests || ""} onChange={(e) => set("guests", Number(e.target.value))} required {...aria("guests")} />
          {err("guests")}
          {isTable && v.guests > max && (
            <p className="mt-1.5 text-[0.875rem]">
              <Link href={pagePath("groupes", lang)} className="link-line">
                {fill(f.bigGroup, { max })}
              </Link>
            </p>
          )}
        </div>
      </div>

      {isTable && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="label">{f.service}</legend>
            <div className="grid grid-cols-2">
              {(["lunch", "dinner"] as Service[]).map((s, i) => (
                <label key={s} className={`seg ${i ? "-ms-px" : ""}`}>
                  <input type="radio" name="service" value={s} checked={v.service === s} onChange={() => set("service", s)} className="sr-only" />
                  {f.services[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor={id("time")} className="label">
              {f.time}
            </label>
            <select id={id("time")} name="time" className="field tabular-nums" value={v.time} onChange={(e) => set("time", e.target.value)} disabled={!times.length} {...aria("time")}>
              {times.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t, lang)}
                </option>
              ))}
            </select>
            {err("time")}
          </div>
        </div>
      )}

      {!isTable && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={id("company")} className="label">
              {f.company} {opt}
            </label>
            <input id={id("company")} name="company" className="field" autoComplete="organization" value={v.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div>
            <label htmlFor={id("budget")} className="label">
              {f.budget} {opt}
            </label>
            <input id={id("budget")} name="budget" className="field" placeholder={f.budgetPh} autoComplete="off" value={v.budget} onChange={(e) => set("budget", e.target.value)} />
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor={id("name")} className="label">
            {f.name}
          </label>
          <input id={id("name")} name="name" className="field" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} required {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={id("phone")} className="label">
            {f.phone}
          </label>
          <input id={id("phone")} name="phone" type="tel" className="field" autoComplete="tel" inputMode="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} required {...aria("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={id("email")} className="label">
            {f.email}
          </label>
          <input id={id("email")} name="email" type="email" spellCheck={false} className="field" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} required {...aria("email")} />
          {err("email")}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={id("message")} className="label">
          {f.message} {opt}
        </label>
        <textarea id={id("message")} name="message" className="field" placeholder={isTable ? f.messagePh : f.groupMessagePh} value={v.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      {/* Champ piège pour les robots, invisible pour les personnes */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${kind}-website`}>Website</label>
        <input id={`${kind}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {failed && (
        <p className="mt-5 border-s-2 border-bordeaux bg-paper p-4 text-[0.9375rem]" role="alert">
          {fill(f.errors.generic, { phone: site.phone })}
        </p>
      )}
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn max-sm:w-full" disabled={sending}>
          {site.whatsapp && <WhatsAppIcon />}
          {sending ? f.sending : isTable ? f.submitTable : f.submitGroup}
        </button>
        <p className="text-[0.875rem] text-muted">
          {f.privacy}{" "}
          <a href={TEL} className="link-line whitespace-nowrap text-ink">
            {fill(f.orCall, { phone: site.phone })}
          </a>
        </p>
      </div>
    </form>
  );
}
