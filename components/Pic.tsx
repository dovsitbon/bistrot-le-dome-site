import Image from "next/image";
import { altOf, type Dict } from "@/lib/i18n";
import { has, img } from "@/lib/media";
import { Booking, Chalkboard, Cocotte, Dome, Glass, Ramekin, Snail, TableGroup } from "@/components/Drawings";

const DRAWINGS = { bourguignon: Cocotte, confit: Cocotte, entrecote: Cocotte, "creme-brulee": Ramekin, escargots: Snail, vins: Glass, equipe: TableGroup, ardoise: Chalkboard, resa: Booking } as const;
export type SlotId = keyof typeof DRAWINGS;

/**
 * Photo de public/media, recadrée dans son cadre.
 * Tant que la photo n'existe pas (à prendre sur place, voir assets/A-PHOTOGRAPHIER.md), un emplacement dessiné
 * tient la place : papier crème, filet laiton, dessin au trait et nom du plat. Aucune fausse photo.
 */
export function Pic({
  src,
  d,
  sizes,
  className = "",
  priority = false,
  position = "center",
  alt,
  slot,
}: {
  src: string;
  d: Dict;
  sizes: string;
  className?: string;
  priority?: boolean;
  position?: string;
  alt?: string;
  slot?: SlotId;
}) {
  if (!src || !has(src)) {
    const Drawing = slot ? DRAWINGS[slot] : Dome;
    const label = slot && slot in d.slots ? d.slots[slot as keyof Dict["slots"]] : "";
    return (
      <div className={`relative flex flex-col items-center justify-center gap-4 bg-paper-deep text-brass-ink ${className}`} data-photo-slot={src || slot || "vide"}>
        <div className="pointer-events-none absolute inset-3 border border-brass/50" aria-hidden="true" />
        <Drawing className="h-16 w-16 md:h-20 md:w-20" strokeWidth={1.1} />
        {label && <p className="display px-6 text-center text-[1.375rem] italic text-ink/80">{label}</p>}
      </div>
    );
  }
  const i = img(src);
  return (
    <div className={`zoom ${className}`}>
      <Image src={i.src} alt={alt ?? altOf(d, i.src)} width={i.width} height={i.height} sizes={sizes} quality={80} priority={priority} fetchPriority={priority ? "high" : undefined} className="h-full w-full object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
