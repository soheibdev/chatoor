"use client";

import { useEffect, useState } from "react";

/** "Desktop" in the design means viewport ≥ 760px. Mobile is < 760px. */
export const DESK_BP = 760;

export default function useIsDesktop(initial = true) {
  const [desk, setDesk] = useState(initial);
  useEffect(() => {
    const read = () => setDesk(window.innerWidth >= DESK_BP);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return desk;
}

export function useViewportWidth(initial = 1280) {
  const [w, setW] = useState(initial);
  useEffect(() => {
    const read = () => setW(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return w;
}

export function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setRm(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return rm;
}
