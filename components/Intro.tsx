"use client";

import { useEffect, useState } from "react";
import { DOME } from "@/components/Drawings";

/**
 * Effet d'ouverture (1,2 s, une fois par session) : fond crème, une coupole se dessine au trait laiton,
 * « LE DÔME » apparaît, puis « BISTROT · PARIS », fondu sur le hero.
 * Styles dans globals.css (.intro-*). Masqué d'office si déjà vu ou si l'utilisateur préfère réduire les animations.
 */
export function Intro({ skipLabel, tagline }: { skipLabel: string; tagline: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem("dome-intro", "1");
    } catch {}
    const t = setTimeout(() => setGone(true), 1250);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;
  return (
    <div className="intro-curtain">
      <svg viewBox="0 0 48 48" className="h-24 w-24 text-brass md:h-28 md:w-28" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path className="intro-draw" pathLength={1} d={DOME.base} />
        <path className="intro-draw" pathLength={1} d={DOME.dome} />
        <path className="intro-draw intro-draw-2" pathLength={1} d={DOME.ribs} />
        <path className="intro-draw intro-draw-2" pathLength={1} d={DOME.lantern} />
      </svg>
      <p className="intro-word display mt-5 text-[2.5rem] font-semibold tracking-[0.14em] text-navy md:text-[3rem]" aria-hidden="true">
        LE DÔME
      </p>
      <p className="intro-word intro-word-2 sign mt-2 !tracking-[0.42em] text-brass-ink" aria-hidden="true">
        {tagline}
      </p>
      <button type="button" onClick={() => setGone(true)} className="absolute end-5 bottom-5 min-h-11 px-3 text-sm text-muted underline underline-offset-4">
        {skipLabel}
      </button>
    </div>
  );
}
