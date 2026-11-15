import { formatTime } from "@/lib/format";
import { sameEveryDay, weekHours } from "@/lib/hours";
import type { Dict, Locale } from "@/lib/i18n";

const range = (slots: [string, string][], lang: Locale) => slots.map(([a, b]) => `${formatTime(a, lang)} – ${formatTime(b, lang)}`).join(" · ");

/** Horaires de la semaine (data/horaires.json) : une ligne « Tous les jours » s'ils sont identiques, sinon du lundi au dimanche. */
export function HoursTable({ lang, d, className = "" }: { lang: Locale; d: Dict; className?: string }) {
  const week = weekHours();
  const rows: [string, [string, string][]][] = sameEveryDay() ? [[d.access.everyDay, week[0]]] : week.map((s, i) => [d.infos.days[i], s]);
  return (
    <table className={`w-full text-[0.9375rem] ${className}`}>
      <tbody>
        {rows.map(([day, slots]) => (
          <tr key={day} className="border-b border-current/15 last:border-0">
            <th scope="row" className="py-2 pe-4 text-start font-normal">
              {day}
            </th>
            <td className={`py-2 text-end tabular-nums ${slots.length ? "" : "opacity-70"}`}>{slots.length ? range(slots, lang) : d.infos.closed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
