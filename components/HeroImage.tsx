"use client";

import { motion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Photo du hero : très léger recul à l'arrivée (1,04 → 1 en 1,6 s), comme quand l'œil s'habitue à la lumière.
 * La photo est visible dès le premier rendu (aucun fondu qui retarderait l'affichage) ; mouvement coupé si
 * l'utilisateur préfère réduire les animations.
 */
export function HeroImage({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className="absolute inset-0 -z-20" initial={{ scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
