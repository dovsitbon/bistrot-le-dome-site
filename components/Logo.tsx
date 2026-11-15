import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/logo-paths";

/**
 * Le vrai logo du Bistrot Le Dôme (lettrage « BISTROT LE DÔME » à ombre portée), à la couleur du texte.
 * Tracés générés par scripts/logo.mjs depuis assets/logo/logo-origine.svg.
 */
export function Logo({ className = "h-11 w-auto md:h-12", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} fill="currentColor" fillRule="evenodd" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
