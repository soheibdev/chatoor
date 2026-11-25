"use client";

export type Theme = "dark" | "light";
const KEY = "ym:theme";

export function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem(KEY);
  return t === "light" ? "light" : "dark";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try {
    window.localStorage.setItem(KEY, t);
  } catch {
    /* private mode */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** Inline script so the stored theme is on <html> before first paint. */
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem('${KEY}');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;
