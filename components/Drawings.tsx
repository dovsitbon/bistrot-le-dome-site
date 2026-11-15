// Dessins au trait du site, tous dans une boîte 48 × 48 et le même trait fin, couleur courante :
// la coupole (signature du Dôme), et les pictos des tuiles, des services et des emplacements photo.
type P = { className?: string; strokeWidth?: number };

const svg = (className: string, strokeWidth: number) => ({
  viewBox: "0 0 48 48",
  className,
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

/** Coupole : tambour, dôme à côtes, lanterne et épi. Les tracés servent aussi à l'intro et au favicon. */
export const DOME = {
  base: "M7 40h34M10 40v-5h28v5",
  dome: "M11 35c0-11 5.8-18.5 13-18.5S37 24 37 35",
  ribs: "M24 16.5V35M17.6 19.6C16 23.6 15.4 29 15.5 35M30.4 19.6C32 23.6 32.6 29 32.5 35",
  lantern: "M21.5 16.5v-4h5v4M24 12.5V7.5",
};

export const Dome = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d={DOME.base} />
    <path d={DOME.dome} />
    <path d={DOME.ribs} />
    <path d={DOME.lantern} />
    <circle cx="24" cy="6" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/** Cocotte en fonte, couvercle et vapeur : le plat mijoté (bourguignon). */
export const Cocotte = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M9 24h30v6.5c0 4.7-3.8 8.5-8.5 8.5h-13A8.5 8.5 0 0 1 9 30.5V24Z" />
    <path d="M6.5 25.5H9M39 25.5h2.5M8 24c1.5-3.5 8-5.5 16-5.5S38.5 20.5 40 24" />
    <path d="M21.5 18.7c.3-1.6 1.2-2.4 2.5-2.4s2.2.8 2.5 2.4" />
    <path d="M18 12c-1.2-1.6 1.2-2.8 0-4.6M24 11.5c-1.2-1.6 1.2-2.8 0-4.6M30 12c-1.2-1.6 1.2-2.8 0-4.6" />
  </svg>
);

/** Escargot dans sa coquille. */
export const Snail = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M6 36h30c3 0 5.5-1.8 6-4.5" />
    <path d="M12 36c-2.5-1.5-4-4.3-4-7.5a10.5 10.5 0 0 1 21 0c0 4.3-3.4 7.5-7.5 7.5a6 6 0 0 1-6-6 4.3 4.3 0 0 1 8.6 0c0 1.7-1.3 3-3 3" />
    <path d="M36 36c.5-2.7.3-6 2.5-9M38.5 27l-1.5-4.5M38.5 27l3.5-3.3" />
  </svg>
);

/** Verre à vin à pied. */
export const Glass = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M15.5 6h17s1.5 7 1.5 11.5C34 23.3 29.5 27 24 27s-10-3.7-10-9.5C14 13 15.5 6 15.5 6Z" />
    <path d="M14.6 15.5h18.8M24 27v13M17 41h14" />
  </svg>
);

/** Ramequin de crème brûlée et sa cuillère. */
export const Ramekin = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <ellipse cx="22" cy="23" rx="15" ry="4.5" />
    <path d="M7 23v8.5c0 2.5 6.7 4.5 15 4.5s15-2 15-4.5V23" />
    <path d="M7 27.5c2.5 1.6 8.5 2.8 15 2.8s12.5-1.2 15-2.8" />
    <path d="M14 22.3c2.5-.8 5-.6 7.5.5M24.5 23.8c2.2.4 4.3.1 6.3-.8" />
    <path d="M33 14.5 43 7.5" />
    <ellipse cx="31.2" cy="15.8" rx="2.6" ry="1.5" transform="rotate(-35 31.2 15.8)" />
  </svg>
);

/** Ardoise sur chevalet : le plat du jour. */
export const Chalkboard = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <rect x="10" y="6" width="28" height="26" rx="1" />
    <path d="M14 14h12M14 19h20M14 24h16M13 32l-4 10M35 32l4 10M24 32v10" />
  </svg>
);

/** Fait maison : une toque. */
export const Toque = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M15 29.5c-4.4-.6-7.5-4-7.5-8 0-4.4 3.6-8 8-8 .9 0 1.8.1 2.6.4A7.3 7.3 0 0 1 24 10a7.3 7.3 0 0 1 5.9 3.9c.8-.3 1.7-.4 2.6-.4 4.4 0 8 3.6 8 8 0 4-3.1 7.4-7.5 8" />
    <path d="M15 27v11h18V27M15 34h18" />
  </svg>
);

/** Salons : un pavillon d'exposition et un marcheur. */
export const Pavilion = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M4 40h40M7 40V22l13-7 13 7v18" />
    <path d="M12 40v-9h16v9M7 22h26" />
    <circle cx="39.5" cy="21" r="2" />
    <path d="M39.5 23.5v8l-2.5 8.5M39.5 31.5l2.5 8.5M36 28l3.5-3 3.5 3" />
  </svg>
);

/** Groupes : une grande table et ses chaises. */
export const TableGroup = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <path d="M8 24h32M12 24v14M36 24v14" />
    <path d="M4 16v22M4 30h5v8M44 16v22M44 30h-5v8" />
    <circle cx="18" cy="19" r="2.2" />
    <circle cx="30" cy="19" r="2.2" />
    <path d="M22 21.5h4" />
  </svg>
);

/** Réservation : un carnet et une plume. */
export const Booking = ({ className = "h-8 w-8", strokeWidth = 1.3 }: P) => (
  <svg {...svg(className, strokeWidth)}>
    <rect x="8" y="9" width="26" height="31" rx="1" />
    <path d="M14 6v6M28 6v6M8 17h26M13 23h6M13 28h11M13 33h8" />
    <path d="M42 18 30.5 33.5l-3 1.5.6-3.3L39.6 16.2a1.7 1.7 0 0 1 2.4 1.8Z" />
  </svg>
);
