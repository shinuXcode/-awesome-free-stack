"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function RouteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      className="route-motion"
      initial={reduceMotion ? false : { opacity: 0, y: 9 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
