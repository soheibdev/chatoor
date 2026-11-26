"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";

/* ---------------------------------------------------------------------------
   "The Makers / Your Turn" — port of YmMakers.dc.html.
   Content placeholders (names, roles, quotes, socials, prize) live in MAKERS /
   props, not in markup.
---------------------------------------------------------------------------- */

export interface Maker {
  tag: string;
  name: string;
  role: string;
  cls: string;
  track: "ps" | "ctf" | "ai";
  quote: string;
  stats: [string, number][];
  gh: string;
  li: string;
  /** face centre in the 1672×941 photo, used to crop avatars */
  face: [number, number];
}

export const MAKERS: Maker[] = [
  {
    tag: "P1", name: "Laaraf Mohamed Soheib", role: "Lead builder · Problem Solving", cls: "Algorithm Architect", track: "ps",
    quote: "If it passes on the first try, I made it too easy.",
    stats: [["Logic", 94], ["Speed", 81], ["Edge cases", 88]], gh: "https://github.com/soheibdev", li: "https://www.linkedin.com/in/laaraf-mohamed-soheib-12b179261/", face: [860, 285],
  },
  {
    tag: "P2", name: "Bezai Ayoub", role: "Lead builder · Cybersecurity", cls: "CTF Master", track: "ctf",
    quote: "Every flag is hiding somewhere you already looked.",
    stats: [["Exploits", 92], ["Recon", 86], ["Stealth", 79]], gh: "#", li: "https://www.linkedin.com/in/ayoub-bezai-b55315288/", face: [1256, 255],
  },
];

const LINES = ["WE BUILT", "THE CHALLENGE.", "NOW IT'S", "YOUR TURN."];
const TOTAL = 40;

const TR: Record<string, [string, string, string, string]> = {
  ps: ["B", "code-xml", "PS · Problem Solving", "PS"],
  ctf: ["R", "shield", "CTF · Cybersecurity", "CTF"],
  ai: ["G", "brain", "AI · AI/ML", "AI"],
};

const TOASTS: Record<string, { icon: string; ibg: string; ifg: string; title: string; msg: string; cta: boolean; ln: string; ring: string }> = {
  egg: {
    icon: "flag", ibg: "#FBBC04", ifg: "#201A00", title: "Flag captured! 🎉",
    msg: "Now go find the real ones.", cta: true, ln: "rgba(251,188,4,.55)", ring: "rgba(251,188,4,.14)",
  },
  accept: {
    icon: "gamepad-2", ibg: "var(--Bs)", ifg: "var(--Bt)", title: "Join the arena",
    msg: "In the app this opens the registration slide-over.", cta: false, ln: "rgba(255,255,255,.18)", ring: "transparent",
  },
};

function av(size: number, face: [number, number]) {
  const sc = size / 210;
  return {
    s: `${Math.round(1672 * sc)}px auto`,
    p: `${-(face[0] * sc - size / 2).toFixed(1)}px ${-(face[1] * sc - size / 2).toFixed(1)}px`,
  };
}

const SECTION_VARS: CSSProperties = {
  // the section carries its own, slightly lighter palette
  ["--bg" as string]: "#0B0A18",
  ["--s1" as string]: "#1A1928",
  ["--s2" as string]: "#232236",
  ["--ln" as string]: "rgba(255,255,255,.12)",
  ["--fg" as string]: "#F3F2F8",
  ["--fg2" as string]: "#C9C6DA",
  ["--fg3" as string]: "#9895B0",
  ["--B" as string]: "#4285F4",
  ["--R" as string]: "#EA4335",
  ["--Y" as string]: "#FBBC04",
  ["--G" as string]: "#34A853",
  ["--Bt" as string]: "#8AB4F8",
  ["--Rt" as string]: "#F28B82",
  ["--Yt" as string]: "#FDD663",
  ["--Gt" as string]: "#81C995",
  ["--Bs" as string]: "rgba(66,133,244,.18)",
  ["--Rs" as string]: "rgba(234,67,53,.18)",
  ["--Ys" as string]: "rgba(251,188,4,.16)",
  ["--Gs" as string]: "rgba(52,168,83,.18)",
};

export default function Makers({
  onAccept,
  prize = "Top 3 on the final leaderboard win the Season 1 trophy.",
  cutout,
}: {
  onAccept?: () => void;
  prize?: string;
  cutout?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState<number | null>(null);
  const [trophy, setTrophy] = useState(false);
  const [toastK, setToastK] = useState<string | null>(null);
  const [typed, setTyped] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [under, setUnder] = useState(false);
  const [w, setW] = useState(1440);
  const [rm, setRm] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [opened, setOpened] = useState(false);
  const [car, setCar] = useState(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const flagRef = useRef<HTMLButtonElement | null>(null);
  const carRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef<number | null>(null);
  const hovering = useRef(false);
  const ot = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ct = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tx = useRef<number | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const syncLayer = useCallback(() => {
    const L = layerRef.current;
    const r = rootRef.current;
    if (!L || !r) return;
    r.style.setProperty("--lw", L.offsetWidth + "px");
    r.style.setProperty("--lh", L.offsetHeight + "px");
  }, []);

  /* type-on, once, when 35% in view */
  const type = useCallback(
    (n: number) => {
      if (n >= TOTAL) {
        setTyped(TOTAL);
        setGlitch(true);
        later(() => {
          setGlitch(false);
          setUnder(true);
        }, 640);
        return;
      }
      setTyped(n + 1);
      const ends = [8, 22, 30];
      later(() => type(n + 1), ends.includes(n + 1) ? 170 : 34);
    },
    [later],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setRm(reduce);
    setCanHover(hover);
    setW(root.offsetWidth);

    const ro = new ResizeObserver(() => {
      setW(root.offsetWidth);
      syncLayer();
    });
    ro.observe(root);
    syncLayer();

    let io: IntersectionObserver | null = null;
    if (reduce) {
      setTyped(TOTAL);
      setUnder(true);
    } else {
      io = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            io?.disconnect();
            type(0);
          }
        },
        { threshold: 0.35 },
      );
      io.observe(root);
    }
    const ts = timers.current;
    return () => {
      ro.disconnect();
      io?.disconnect();
      ts.forEach(clearTimeout);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const desk = w >= 760 && canHover;
  const mob = !desk;
  const tight = desk && (w * 941) / 1672 < 780;

  const setOpenState = useCallback((v: boolean) => {
    if (v) {
      setOpen(true);
      setOpened(true);
    } else {
      setOpen(false);
      setHero(null);
      setTrophy(false);
    }
  }, []);

  const toast = useCallback(
    (kind: string) => {
      setToastK(kind);
      if (tt.current) clearTimeout(tt.current);
      tt.current = later(() => setToastK(null), 6500);
    },
    [later],
  );

  const accept = () => {
    if (onAccept) onAccept();
    else toast("accept");
  };

  /* ---------- headline lines ---------- */
  let acc = 0;
  const lines = LINES.map((t, i) => {
    const n = Math.max(0, Math.min(t.length, typed - acc));
    const cur =
      (typed < TOTAL && typed >= acc && typed < acc + t.length + (i === 3 ? 1 : 0) && (n < t.length || i === 3)) ||
      (typed >= TOTAL && i === 3);
    acc += t.length;
    const big = i >= 2;
    const last = i === 3;
    return {
      typed: t.slice(0, n),
      rest: t.slice(n),
      cur: cur && !rm,
      last,
      glitch: last && glitch,
      fs: desk ? (big ? "4.5cqw" : "3.3cqw") : big ? "36px" : "26px",
      fw: big ? 900 : 800,
      skew: big ? "-8deg" : "0deg",
      bg: last ? "linear-gradient(90deg,#8AB4F8,#F28B82 38%,#FDD663 66%,#81C995)" : "none",
      col: last ? "transparent" : "#fff",
      baseAnim: last && glitch ? "ymGlBase .6s linear both" : "none",
    };
  });

  const stagger = (i: number) =>
    rm
      ? "opacity .2s ease-out"
      : open
        ? `opacity .3s ease-out ${90 + i * 60}ms, transform .45s cubic-bezier(.16,1,.3,1) ${90 + i * 60}ms`
        : "opacity .15s ease-in, transform .3s cubic-bezier(.4,0,1,1)";

  const makers = MAKERS.map((m, i) => {
    const [k, icon, trackLabel, trackShort] = TR[m.track];
    const on = hero === i;
    const a44 = av(44, m.face);
    const a56 = av(56, m.face);
    return {
      ...m,
      icon,
      trackLabel,
      trackShort,
      tc: `var(--${k})`,
      ts: `var(--${k}s)`,
      tt: `var(--${k}t)`,
      av44s: a44.s,
      av44p: a44.p,
      av56s: a56.s,
      av56p: a56.p,
      stats: m.stats.map(([kk, v], j) => ({ k: kk, v, w: v + "%", d: rm ? "0ms" : `${120 + j * 80}ms` })),
      showCard: desk && on,
      cL: open ? (i === 0 ? "38%" : "13%") : i === 0 ? "70%" : "44%",
      cT: "44%",
      bg: on ? `color-mix(in oklab, var(--${k}) 16%, rgba(255,255,255,.04))` : "rgba(255,255,255,.04)",
      ln: on ? `var(--${k})` : "var(--ln)",
      ring: mob && on ? `0 0 0 3px var(--${k}s)` : "none",
      tr: stagger(1 + i),
      aria: `${m.name}, ${m.cls}, ${trackLabel}. ${m.quote}`,
      ghLabel: `${m.name} on GitHub`,
      liLabel: `${m.name} on LinkedIn`,
      sel: () => setHero(i),
      unsel: () => setHero((h) => (h === i ? null : h)),
      pick: () => {
        setHero(i);
        const c = carRef.current;
        if (c) c.scrollTo({ left: i ? c.scrollWidth : 0, behavior: rm ? "auto" : "smooth" });
      },
    };
  });

  const logoOn = open || hero !== null;
  const logos = ([[52.2, 68.4, 0], [86.4, 66.3, 1], [6.0, 92.0, -1]] as [number, number, number][]).map(
    ([x, y, i]) => {
      const strong = hero === i;
      const soft = logoOn && i === -1 ? !open : logoOn;
      return {
        key: `${x}-${y}`,
        x: x + "%",
        y: y + "%",
        fs: i === -1 ? "2.1cqw" : "2.3cqw",
        op: strong ? 1 : soft ? 0.55 : 0,
        anim: (strong || (i === -1 && soft)) && !rm ? "ymLogo 1.6s ease-in-out infinite" : "none",
      };
    },
  );

  const toastT = TOASTS[toastK ?? "egg"] ?? TOASTS.egg;

  /* ---------- geometry ---------- */
  const rAspect = desk ? "1672 / 941" : "auto";
  const hPos = desk ? ("absolute" as const) : ("relative" as const);
  const pOp = open ? 1 : 0;
  const iX = open || rm ? "0" : "24px";

  /* ---------- pointer handlers ---------- */
  const enter = () => {
    if (!desk) return;
    hovering.current = true;
    if (ct.current) clearTimeout(ct.current);
    ot.current = later(() => setOpenState(true), 160);
    rootRef.current?.style.setProperty("--so", "1");
  };
  const leave = () => {
    if (!desk) return;
    hovering.current = false;
    if (ot.current) clearTimeout(ot.current);
    ct.current = later(() => {
      const r = rootRef.current;
      if (!r || !r.contains(document.activeElement) || document.activeElement === r) setOpenState(false);
    }, 220);
    const r = rootRef.current;
    if (r) {
      r.style.setProperty("--so", "0");
      r.style.setProperty("--mx", "0");
      r.style.setProperty("--my", "0");
    }
  };
  const move = (e: React.MouseEvent) => {
    if (!desk) return;
    const cx = e.clientX;
    const cy = e.clientY;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const r = rootRef.current;
      const L = layerRef.current;
      if (!r) return;
      const rr = r.getBoundingClientRect();
      if (!rm) {
        r.style.setProperty("--mx", (((cx - rr.left) / rr.width) * 2 - 1).toFixed(3));
        r.style.setProperty("--my", (((cy - rr.top) / rr.height) * 2 - 1).toFixed(3));
      }
      if (L) {
        const lr = L.getBoundingClientRect();
        const s = lr.width / L.offsetWidth;
        r.style.setProperty("--sx", ((cx - lr.left) / s).toFixed(1) + "px");
        r.style.setProperty("--sy", ((cy - lr.top) / s).toFixed(1) + "px");
      }
    });
  };

  return (
    <section
      ref={rootRef as React.RefObject<HTMLElement>}
      tabIndex={0}
      role="region"
      aria-roledescription="interactive section"
      aria-label="Meet the makers of the challenges. Press Enter or Tab to open."
      onMouseEnter={enter}
      onMouseLeave={leave}
      onMouseMove={move}
      onFocus={() => {
        if (!desk) return;
        if (ct.current) clearTimeout(ct.current);
        if (!open) setOpenState(true);
      }}
      onBlur={(e) => {
        if (!desk) return;
        const r = rootRef.current;
        if (r && !r.contains(e.relatedTarget as Node) && !hovering.current) setOpenState(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpenState(false);
          rootRef.current?.focus();
        }
        if ((e.key === "Enter" || e.key === " ") && e.target === rootRef.current) {
          e.preventDefault();
          setOpenState(true);
        }
      }}
      style={{
        ...SECTION_VARS,
        position: "relative",
        containerType: "inline-size",
        overflow: "hidden",
        width: "100%",
        maxWidth: "none",
        aspectRatio: rAspect,
        display: desk ? "block" : "flex",
        flexDirection: "column",
        paddingBottom: desk ? 0 : 24,
        boxSizing: "border-box",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--fu)",
        outline: 0,
      }}
    >
      {/* ------------------------------ HEADLINE ------------------------------ */}
      <div
        style={{
          position: hPos,
          left: "5%",
          top: "9%",
          zIndex: 3,
          width: desk ? "44%" : "100%",
          padding: desk ? 0 : "28px 16px 22px",
          boxSizing: "border-box",
          pointerEvents: "none",
          opacity: desk && open ? 0 : 1,
          transform: `translate3d(${desk && open && !rm ? "-40px" : "0px"},0,0)`,
          transition: "opacity .25s ease-out, transform .45s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: desk ? "1.1cqw" : 14,
            transform: `translate3d(calc(var(--mx,0) * ${desk && !rm ? "14px" : "0px"}),calc(var(--my,0) * ${desk && !rm ? "8px" : "0px"}),0)`,
            transition: "transform .2s ease-out",
          }}
        >
          <span
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 40,
              padding: "0 14px 0 5px",
              borderRadius: 12,
              background: "rgba(14,13,26,.72)",
              border: "1px solid var(--ln)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "#fff", display: "grid", placeItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/gdgc-mark.png" alt="GDGC logo" style={{ width: 22, height: "auto", display: "block" }} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>Built by GDGC Batna</span>
          </span>

          <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: desk ? 14 : 12.5, color: "var(--Yt)", letterSpacing: ".02em" }}>
            &lt;choose_your_challenger/&gt;
          </span>

          <h2
            aria-label="We built the challenge. Now it's your turn."
            style={{
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: desk ? ".6cqw" : 6,
              fontFamily: "var(--fd)",
              fontWeight: 800,
              letterSpacing: "-.025em",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {lines.map((l, i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  position: "relative",
                  alignSelf: "flex-start",
                  fontSize: l.fs,
                  fontWeight: l.fw,
                  transform: `skewX(${l.skew})`,
                  transformOrigin: "left bottom",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ position: "relative", display: "inline-block", animation: l.baseAnim }}>
                  <span
                    style={{
                      background: l.bg,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: l.col,
                    }}
                  >
                    {l.typed}
                  </span>
                  {l.cur ? (
                    <span style={{ display: "inline-block", position: "relative", width: 0, height: ".82em", verticalAlign: "-.04em" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: ".04em",
                          top: 0,
                          width: ".09em",
                          height: "100%",
                          background: "var(--Y)",
                          animation: "ymBlink 1s steps(1) infinite",
                        }}
                      />
                    </span>
                  ) : null}
                  <span style={{ opacity: 0 }}>{l.rest}</span>
                </span>

                {l.glitch
                  ? ([
                      ["#4285F4", "translate(-4px,2px)", "0ms"],
                      ["#EA4335", "translate(4px,-2px)", "90ms"],
                      ["#FBBC04", "translate(-3px,-1px)", "180ms"],
                      ["#34A853", "translate(3px,2px)", "270ms"],
                      ["#4285F4", "translate(-2px,0)", "360ms"],
                    ] as [string, string, string][]).map(([c, tf, d], j) => (
                      <span
                        key={j}
                        style={{
                          position: "absolute",
                          inset: 0,
                          color: c,
                          opacity: 0,
                          transform: tf,
                          animation: `ymGl .6s linear ${d} forwards`,
                        }}
                      >
                        YOUR TURN.
                      </span>
                    ))
                  : null}

                {l.last ? (
                  <span
                    style={{
                      position: "absolute",
                      left: "-.2em",
                      right: "-.6em",
                      bottom: "-.34em",
                      height: ".2em",
                      clipPath: "polygon(0 70%,4% 30%,100% 0,97% 60%,30% 100%,2% 100%)",
                      background: "linear-gradient(90deg,#4285F4 0 25%,#EA4335 25% 50%,#FBBC04 50% 75%,#34A853 75% 100%)",
                      transformOrigin: "left center",
                      transform: `scaleX(${under ? 1 : 0})`,
                      animation: under && !rm ? "ymDraw .42s cubic-bezier(.16,1,.3,1) both" : "none",
                    }}
                  />
                ) : null}
              </span>
            ))}
          </h2>

          {desk ? (
            <span
              style={{
                alignSelf: "flex-start",
                marginTop: "1.6cqw",
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 40,
                padding: "0 14px",
                borderRadius: 999,
                background: "rgba(14,13,26,.72)",
                border: "1px solid var(--ln)",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--fg2)",
                whiteSpace: "nowrap",
              }}
            >
              <Icon n="mouse-pointer-2" s={16} style={{ color: "var(--Yt)" }} />
              Hover to meet the makers
              <span
                style={{
                  fontFamily: "var(--fm)",
                  fontSize: 11.5,
                  padding: "2px 7px",
                  borderRadius: 6,
                  border: "1px solid var(--ln)",
                  color: "var(--fg3)",
                }}
              >
                or Tab
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {/* ------------------------------ PHOTO FRAME ------------------------------ */}
      <div
        onClick={() => {
          if (mob) setOpenState(true);
        }}
        onTouchStart={(e) => {
          tx.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (tx.current == null) return;
          const dx = e.changedTouches[0].clientX - tx.current;
          tx.current = null;
          if (dx < -40) setOpenState(true);
        }}
        style={{
          position: desk ? "absolute" : "relative",
          inset: desk ? 0 : "auto",
          margin: desk ? 0 : "0 16px",
          borderRadius: desk ? 0 : 20,
          aspectRatio: desk ? "auto" : "4 / 3",
          overflow: "hidden",
          zIndex: 1,
          transform: `translate3d(${desk && open && !rm ? "-28%" : "0"},0,0)`,
          transition: "transform .45s cubic-bezier(.16,1,.3,1)",
          cursor: mob ? "pointer" : "default",
        }}
      >
        <div
          ref={layerRef}
          style={{
            position: "absolute",
            top: 0,
            left: desk ? 0 : "auto",
            right: desk ? "auto" : 0,
            width: desk ? "100%" : "133.1%",
            aspectRatio: "1672 / 941",
            containerType: "inline-size",
            transform:
              desk && !rm
                ? "translate3d(calc(var(--mx,0) * -10px),calc(var(--my,0) * -6px),0) scale(1.04)"
                : "none",
            transition: "transform .2s ease-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/makers-bg.jpg"
            alt="Two GDGC Batna builders in black hoodies with code logos, arms crossed, in front of code screens and a trophy"
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
          />
          {cutout ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cutout}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "translate3d(calc(var(--mx,0) * -6px),calc(var(--my,0) * -3px),0)",
                transition: "transform .2s ease-out",
              }}
            />
          ) : null}

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg,rgba(8,7,20,.9) 0%,rgba(8,7,20,.62) 30%,rgba(8,7,20,0) 50%)",
              opacity: desk ? (open ? 0.45 : 1) : 0,
              transition: "opacity .45s",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(0deg,rgba(8,7,20,.55),transparent 30%)",
              pointerEvents: "none",
            }}
          />

          {/* faint code with the hidden flag */}
          <div
            style={{
              position: "absolute",
              left: "36%",
              top: "1.4%",
              zIndex: 2,
              fontFamily: "var(--fm)",
              fontSize: ".78cqw",
              lineHeight: 1.7,
              whiteSpace: "nowrap",
              color: "#A9B8FF",
              opacity: mob ? 0.3 : 0.2,
              filter: "blur(.6px)",
              pointerEvents: "none",
            }}
          >
            <div>{"// arena.config · season_01"}</div>
            <div>
              const vault = &quot;
              <button
                ref={flagRef}
                onClick={(e) => {
                  e.stopPropagation();
                  toast("egg");
                }}
                aria-label="Hidden flag"
                style={{ all: "unset", pointerEvents: "auto", cursor: "crosshair", borderRadius: 3 }}
              >
                gdgbatna&#123;y0u_f0und_m3&#125;
              </button>
              &quot;;
            </div>
            <div>export const tracks = [&quot;ps&quot;, &quot;ctf&quot;, &quot;ai&quot;];</div>
          </div>
          {mob ? (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "46.5%",
                top: "4.2%",
                zIndex: 2,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--Y)",
                animation: "ymDot2 1.8s infinite",
                pointerEvents: "none",
              }}
            />
          ) : null}

          {/* spotlight + dim */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "rgba(6,5,14,.3)", opacity: open && desk ? 1 : 0, transition: "opacity .45s" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse 21% 62% at 48% 52%,rgba(6,5,14,0) 55%,rgba(6,5,14,.74) 100%)", opacity: hero === 0 ? 1 : 0, transition: "opacity .24s ease-out" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(circle at 50% 36%,rgba(66,133,244,.34),transparent 30%)", mixBlendMode: "screen", opacity: hero === 0 ? 1 : 0, transition: "opacity .24s ease-out" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse 18% 62% at 82% 52%,rgba(6,5,14,0) 55%,rgba(6,5,14,.74) 100%)", opacity: hero === 1 ? 1 : 0, transition: "opacity .24s ease-out" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(circle at 75% 32%,rgba(234,67,53,.32),transparent 28%)", mixBlendMode: "screen", opacity: hero === 1 ? 1 : 0, transition: "opacity .24s ease-out" }} />

          {/* glowing </> logos */}
          {logos.map((g) => (
            <span
              key={g.key}
              aria-hidden="true"
              style={{ position: "absolute", left: g.x, top: g.y, zIndex: 3, transform: "translate(-50%,-50%)", pointerEvents: "none" }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "6cqw",
                  height: "6cqw",
                  transform: "translate(-50%,-50%)",
                  borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(138,180,248,.45),rgba(251,188,4,.12) 45%,transparent 70%)",
                  opacity: g.op,
                  animation: g.anim,
                  transition: "opacity .3s",
                }}
              />
              <span
                style={{
                  position: "relative",
                  display: "block",
                  font: `700 ${g.fs}/1 var(--fm)`,
                  letterSpacing: "-.06em",
                  background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 .35cqw rgba(66,133,244,.9))",
                  opacity: g.op,
                  animation: g.anim,
                  transition: "opacity .3s",
                }}
              >
                &lt;/&gt;
              </span>
            </span>
          ))}

          {/* scanner light (desktop) */}
          {desk ? (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 3,
                width: 220,
                height: 220,
                borderRadius: "50%",
                overflow: "hidden",
                pointerEvents: "none",
                opacity: "var(--so,0)" as unknown as number,
                transition: "opacity .25s",
                transform: "translate3d(calc(var(--sx,-999px) - 110px),calc(var(--sy,-999px) - 110px),0)",
                WebkitMaskImage: "radial-gradient(circle,#000 36%,transparent 70%)",
                maskImage: "radial-gradient(circle,#000 36%,transparent 70%)",
                background: "radial-gradient(circle,rgba(138,180,248,.18),transparent 70%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "var(--lw,1440px)",
                  height: "var(--lh,810px)",
                  transform: "translate3d(calc(110px - var(--sx,-999px)),calc(110px - var(--sy,-999px)),0)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "36%",
                    top: "1.4%",
                    fontFamily: "var(--fm)",
                    fontSize: ".78cqw",
                    lineHeight: 1.7,
                    whiteSpace: "nowrap",
                    color: "#E1E8FF",
                    textShadow: "0 0 8px rgba(138,180,248,.6)",
                  }}
                >
                  <div>{"// arena.config · season_01"}</div>
                  <div>
                    const vault = &quot;
                    <span style={{ color: "#FDD663", textShadow: "0 0 10px rgba(251,188,4,.8)" }}>
                      gdgbatna&#123;y0u_f0und_m3&#125;
                    </span>
                    &quot;;
                  </div>
                  <div>export const tracks = [&quot;ps&quot;, &quot;ctf&quot;, &quot;ai&quot;];</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* builder hover zones (desktop) */}
          {desk ? (
            <>
              <div aria-hidden="true" onMouseEnter={() => setHero(0)} onMouseLeave={() => setHero(null)} style={{ position: "absolute", left: "29%", top: "9%", width: "38%", bottom: 0, zIndex: 3 }} />
              <div aria-hidden="true" onMouseEnter={() => setHero(1)} onMouseLeave={() => setHero(null)} style={{ position: "absolute", left: "67%", top: "8%", width: "26%", bottom: 0, zIndex: 3 }} />
            </>
          ) : null}

          {/* trophy hotspot */}
          <button
            aria-label="Season prize"
            aria-describedby="ym-trophy-tip"
            aria-expanded={trophy}
            onMouseEnter={() => desk && setTrophy(true)}
            onMouseLeave={() => desk && setTrophy(false)}
            onFocus={() => desk && setTrophy(true)}
            onBlur={() => desk && setTrophy(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (mob) setTrophy((t) => !t);
            }}
            style={{
              position: "absolute",
              left: "93.4%",
              top: "54%",
              width: "6.2%",
              height: "21%",
              zIndex: 4,
              padding: 0,
              border: 0,
              borderRadius: 14,
              background: "transparent",
              cursor: "help",
              boxShadow: trophy ? "0 0 0 2px rgba(251,188,4,.6),0 0 40px rgba(251,188,4,.45)" : "none",
              transition: "box-shadow .2s",
            }}
          >
            {trophy ? (
              <>
                <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "36%", width: 0, height: 0 }}>
                  {([
                    [9, 9, 2, "#4285F4", "-46px", "-38px", "0ms"],
                    [7, 7, "50%", "#EA4335", "40px", "-44px", "30ms"],
                    [10, 4, 2, "#FBBC04", "-54px", "6px", "60ms"],
                    [8, 8, 2, "#34A853", "30px", "34px", "20ms"],
                    [6, 6, "50%", "#FDD663", "-6px", "-60px", "50ms"],
                    [7, 7, "50%", "#8AB4F8", "-30px", "40px", "80ms"],
                  ] as [number, number, number | string, string, string, string, string][]).map(
                    ([w2, h2, r, c, dx, dy, d], i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          width: w2,
                          height: h2,
                          borderRadius: r,
                          background: c,
                          ["--dx" as string]: dx,
                          ["--dy" as string]: dy,
                          animation: `ymSpark .7s cubic-bezier(.16,1,.3,1) ${d} both`,
                        }}
                      />
                    ),
                  )}
                </span>
                <span
                  id="ym-trophy-tip"
                  role="tooltip"
                  style={{
                    position: "absolute",
                    right: "calc(100% + 12px)",
                    top: "4%",
                    width: mob ? 210 : 250,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(14,13,26,.92)",
                    border: "1px solid rgba(251,188,4,.5)",
                    boxShadow: "0 0 0 4px rgba(251,188,4,.12),0 20px 40px rgba(0,0,0,.5)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    textAlign: "start",
                    cursor: "default",
                    animation: rm ? "ymFade .2s both" : "ymTip .2s ease-out both",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--Y)", color: "#201A00" }}>
                      <Icon n="trophy" s={17} />
                    </span>
                    <b style={{ fontFamily: "var(--fd)", fontSize: 15, color: "var(--fg)" }}>Season Prize</b>
                  </span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.45, color: "var(--fg2)" }}>{prize}</span>
                  <span style={{ display: "flex", gap: 6 }}>
                    {([["rgba(251,188,4,.16)", "#FDD663", "1"], ["rgba(196,199,212,.14)", "#C4C7D4", "2"], ["rgba(215,146,95,.16)", "#D7925F", "3"]] as [string, string, string][]).map(
                      ([bg, fg, n]) => (
                        <span
                          key={n}
                          style={{ flex: 1, height: 26, borderRadius: 8, background: bg, color: fg, font: "800 12px var(--fd)", display: "grid", placeItems: "center" }}
                        >
                          {n}
                        </span>
                      ),
                    )}
                  </span>
                  <span style={{ fontFamily: "var(--fm)", fontSize: 11.5, color: "var(--fg3)" }}>Final standings lock Jan 10</span>
                </span>
              </>
            ) : null}
          </button>
        </div>

        {mob ? (
          <span
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              padding: "0 13px",
              borderRadius: 999,
              background: "rgba(14,13,26,.82)",
              border: "1px solid var(--ln)",
              fontSize: 13.5,
              fontWeight: 700,
              opacity: opened ? 0 : 1,
              transition: "opacity .3s",
              pointerEvents: "none",
            }}
          >
            <Icon n="pointer" s={16} style={{ color: "var(--Yt)" }} />
            Tap to meet the makers
            <span style={{ display: "flex", color: "var(--fg3)", animation: rm ? "none" : "ymNudge 1.8s ease-in-out infinite" }}>
              <Icon n="chevrons-left" s={16} />
            </span>
          </span>
        ) : null}
      </div>

      {/* ------------------------ MOBILE carousel + CTAs ------------------------ */}
      {mob ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 10px" }}>
            <b style={{ fontFamily: "var(--fd)", fontSize: 16 }}>Choose your challenger</b>
            <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg3)" }}>
              {car + 1} / {MAKERS.length}
            </span>
          </div>
          <div
            ref={carRef}
            className="ym-scroll-x"
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
              if (i !== car) {
                setCar(i);
                setHero(i);
              }
            }}
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              padding: "4px 16px 8px",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {makers.map((m) => (
              <article
                key={m.tag}
                onClick={m.pick}
                aria-label={m.aria}
                style={{
                  flex: "none",
                  width: "82%",
                  scrollSnapAlign: "center",
                  borderRadius: 20,
                  background: "var(--s1)",
                  border: `1px solid ${m.ln}`,
                  boxShadow: m.ring,
                  overflow: "hidden",
                  transition: "border-color .2s, box-shadow .2s",
                }}
              >
                <div style={{ height: 4, background: m.tc }} />
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        flex: "none",
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundImage: "url(/assets/makers-bg.jpg)",
                        backgroundSize: m.av56s,
                        backgroundPosition: m.av56p,
                        boxShadow: `0 0 0 2px var(--s1),0 0 0 4px ${m.tc}`,
                      }}
                    />
                    <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "var(--fg3)" }}>
                        {m.tag} · PLAYER CARD
                      </span>
                      <b style={{ fontFamily: "var(--fd)", fontSize: 17 }}>{m.name}</b>
                      <span style={{ fontSize: 13, fontWeight: 700, color: m.tt }}>{m.cls}</span>
                    </span>
                  </div>
                  {m.stats.map((s) => (
                    <div key={s.k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--fg2)" }}>
                        {s.k}
                        <b style={{ fontFamily: "var(--fd)", fontSize: 12, color: "var(--fg)" }}>{s.v}</b>
                      </span>
                      <span style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            width: s.w,
                            borderRadius: 3,
                            background: m.tc,
                            transformOrigin: "left",
                            animation: `ymBar .6s cubic-bezier(.16,1,.3,1) ${s.d} both`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                  <span
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 28,
                      padding: "0 10px 0 7px",
                      borderRadius: 8,
                      background: m.ts,
                      color: m.tt,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    <Icon n={m.icon} s={14} />
                    Specialty · {m.trackLabel}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px 0" }}>
            <button
              onClick={accept}
              style={{
                height: 52,
                border: 0,
                borderRadius: 14,
                background: "#1A73E8",
                boxShadow: "0 4px 0 #174EA6",
                color: "#fff",
                font: "700 16px var(--fu)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                cursor: "pointer",
              }}
            >
              Accept the Challenge
              <Icon n="arrow-right" s={18} />
            </button>
            <button
              onClick={() => setOpenState(true)}
              style={{
                height: 48,
                borderRadius: 14,
                border: "1px solid var(--ln)",
                background: "transparent",
                color: "var(--fg)",
                font: "600 15px var(--fu)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Icon n="users" s={17} />
              Meet the makers
            </button>
          </div>
        </>
      ) : null}

      {/* ---------------------- DESKTOP floating player card ---------------------- */}
      {desk
        ? makers.map((m) =>
            m.showCard ? (
              <div
                key={m.tag}
                role="status"
                aria-live="polite"
                style={{
                  position: "absolute",
                  left: m.cL,
                  top: m.cT,
                  zIndex: 4,
                  width: 290,
                  borderRadius: 20,
                  background: "rgba(14,13,26,.86)",
                  backdropFilter: "blur(14px)",
                  border: `1px solid ${m.tc}`,
                  boxShadow: `0 0 0 4px ${m.ts},0 24px 50px rgba(0,0,0,.5)`,
                  overflow: "hidden",
                  pointerEvents: "none",
                  animation: rm ? "ymFade .2s both" : "ymCardIn .26s cubic-bezier(.34,1.56,.64,1) both",
                }}
              >
                <div style={{ height: 4, background: m.tc }} />
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ height: 24, padding: "0 9px", borderRadius: 7, background: m.tc, color: "#fff", font: "800 11.5px var(--fd)", display: "grid", placeItems: "center" }}>
                      {m.tag}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "var(--fg3)" }}>
                      CHALLENGER SELECTED
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        flex: "none",
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundImage: "url(/assets/makers-bg.jpg)",
                        backgroundSize: m.av56s,
                        backgroundPosition: m.av56p,
                        boxShadow: `0 0 0 2px #0E0D1A,0 0 0 4px ${m.tc}`,
                      }}
                    />
                    <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <b style={{ fontFamily: "var(--fd)", fontSize: 18 }}>{m.name}</b>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: m.tt }}>{m.cls}</span>
                    </span>
                  </div>
                  {m.stats.map((s) => (
                    <div key={s.k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--fg2)" }}>
                        {s.k}
                        <b style={{ fontFamily: "var(--fd)", fontSize: 12, color: "var(--fg)" }}>{s.v}</b>
                      </span>
                      <span style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            width: s.w,
                            borderRadius: 3,
                            background: m.tc,
                            transformOrigin: "left",
                            animation: `ymBar .6s cubic-bezier(.16,1,.3,1) ${s.d} both`,
                          }}
                        />
                      </span>
                    </div>
                  ))}
                  <span
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 28,
                      padding: "0 10px 0 7px",
                      borderRadius: 8,
                      background: m.ts,
                      color: m.tt,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    <Icon n={m.icon} s={14} />
                    Specialty · {m.trackLabel}
                  </span>
                </div>
              </div>
            ) : null,
          )
        : null}

      {/* ------------------------------ GLASS PANEL ------------------------------ */}
      <aside
        aria-label="Meet the Makers – GDGC Batna"
        onTouchStart={(e) => {
          tx.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (tx.current == null) return;
          const dx = e.changedTouches[0].clientX - tx.current;
          tx.current = null;
          if (dx > 40) setOpenState(false);
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: desk ? "clamp(360px, 28%, 440px)" : "100%",
          zIndex: 5,
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          background: "rgba(18,16,34,.66)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderLeft: "1px solid rgba(255,255,255,.12)",
          boxShadow: "-30px 0 60px rgba(0,0,0,.35)",
          transform: `translate3d(${open || rm ? "0" : "104%"},0,0)`,
          opacity: pOp,
          pointerEvents: open ? "auto" : "none",
          transition: rm
            ? "opacity .2s ease-out"
            : open
              ? "transform .45s cubic-bezier(.16,1,.3,1), opacity .3s ease-out"
              : "transform .3s cubic-bezier(.4,0,1,1), opacity .2s ease-in .1s",
        }}
      >
        <div aria-hidden="true" style={{ display: "flex", height: 4 }}>
          {["#4285F4", "#EA4335", "#FBBC04", "#34A853"].map((c) => (
            <span key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div
          style={{
            minHeight: "calc(100% - 4px)",
            padding: desk ? (tight ? "14px 22px" : "18px 24px") : "20px 16px 28px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: desk ? (tight ? 8 : 11) : 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: pOp, transform: `translateX(${iX})`, transition: stagger(0) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "grid", placeItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/gdgc-mark.png" alt="GDGC logo" style={{ width: 24, height: "auto", display: "block" }} />
              </span>
              <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg3)" }}>&lt;makers/&gt;</span>
              <button
                onClick={() => {
                  setOpenState(false);
                  rootRef.current?.focus();
                }}
                aria-label="Close panel"
                style={{
                  marginLeft: "auto",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid var(--ln)",
                  background: "rgba(255,255,255,.04)",
                  color: "var(--fg2)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Icon n="x" s={18} />
              </button>
            </div>
            <h3 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: desk ? (tight ? 20 : 22) : 24, lineHeight: 1.1, letterSpacing: "-.02em" }}>
              Meet the Makers <span style={{ color: "var(--fg3)" }}>–</span> GDGC Batna
            </h3>
            {!desk || !tight ? (
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--fg2)" }}>
                They wrote every quest in Season 1. Your job is to break them.
              </span>
            ) : null}
          </div>

          {makers.map((m) => (
            <article
              key={m.tag}
              tabIndex={0}
              aria-label={m.aria}
              onMouseEnter={m.sel}
              onMouseLeave={m.unsel}
              onFocus={m.sel}
              onBlur={m.unsel}
              style={{
                padding: desk && tight ? "10px 12px" : "12px 14px",
                borderRadius: 16,
                background: m.bg,
                border: `1px solid ${m.ln}`,
                display: "flex",
                flexDirection: "column",
                gap: desk && tight ? 6 : 8,
                opacity: pOp,
                transform: `translateX(${iX})`,
                transition: m.tr,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  role="img"
                  aria-label={m.name}
                  style={{
                    flex: "none",
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    backgroundImage: "url(/assets/makers-bg.jpg)",
                    backgroundSize: m.av44s,
                    backgroundPosition: m.av44p,
                    boxShadow: `0 0 0 2px rgba(18,16,34,1),0 0 0 4px ${m.tc}`,
                  }}
                />
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 16, whiteSpace: "nowrap" }}>{m.name}</b>
                    <span
                      style={{
                        height: 20,
                        padding: "0 7px",
                        borderRadius: 6,
                        background: m.ts,
                        color: m.tt,
                        font: "800 10.5px var(--fu)",
                        letterSpacing: ".04em",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon n={m.icon} s={11} />
                      {m.trackShort}
                    </span>
                  </span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.35, color: "var(--fg3)" }}>{m.role}</span>
                </span>
                <span style={{ flex: "none", display: "flex", gap: 4 }}>
                  <a href={m.gh} aria-label={m.ghLabel} className="ym-makerlink" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ln)", display: "grid", placeItems: "center", color: "var(--fg2)" }}>
                    <Icon n="github" s={16} />
                  </a>
                  <a href={m.li} aria-label={m.liLabel} className="ym-makerlink" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ln)", display: "grid", placeItems: "center", color: "var(--fg2)" }}>
                    <Icon n="linkedin" s={16} />
                  </a>
                </span>
              </div>
              <q className="ym-clamp2" style={{ fontSize: 13.5, lineHeight: 1.4, color: "var(--fg)" }}>
                {m.quote}
              </q>
            </article>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, opacity: pOp, transform: `translateX(${iX})`, transition: stagger(3) }}>
            <div style={{ padding: desk && tight ? "8px 10px" : "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid var(--ln)" }}>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 20 }}>50+</div>
              <div style={{ fontSize: 12.5, color: "var(--fg3)", marginTop: 2 }}>Challenges</div>
            </div>
            <div style={{ padding: desk && tight ? "8px 10px" : "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid var(--ln)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 20 }}>3</span>
                <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>Tracks</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {([["var(--Bs)", "var(--Bt)", "PS"], ["var(--Rs)", "var(--Rt)", "CTF"], ["var(--Gs)", "var(--Gt)", "AI"]] as [string, string, string][]).map(
                  ([bg, fg, l]) => (
                    <span key={l} style={{ height: 20, padding: "0 6px", borderRadius: 6, background: bg, color: fg, fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center" }}>
                      {l}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", padding: desk && tight ? "8px 10px" : "10px 12px", borderRadius: 14, background: "rgba(255,255,255,.05)", border: "1px solid var(--ln)", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon n="calendar-days" s={17} style={{ color: "var(--Yt)" }} />
              <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>Season 1</span>
              <b style={{ marginLeft: "auto", fontFamily: "var(--fd)", fontSize: 14 }}>Dec 10 → Jan 10</b>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: pOp, transform: `translateX(${iX})`, transition: stagger(4) }}>
            <button
              onClick={accept}
              className="ym-press"
              style={{
                height: desk && tight ? 46 : 50,
                border: 0,
                borderRadius: 14,
                background: "#1A73E8",
                boxShadow: "0 4px 0 #174EA6",
                color: "#fff",
                font: "700 16px var(--fu)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                cursor: "pointer",
                transition: "transform .12s, box-shadow .12s",
                ["--base" as string]: "#174EA6",
              }}
            >
              Accept the Challenge
              <Icon n="arrow-right" s={18} />
            </button>
            <a
              href="#tracks"
              className="ym-ghost-white"
              style={{
                height: desk && tight ? 42 : 44,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.2)",
                color: "var(--fg)",
                font: "600 15px var(--fu)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Icon n="compass" s={17} />
              Explore Tracks
            </a>
          </div>
        </div>
      </aside>

      {/* ------------------------------ TOAST ------------------------------ */}
      {toastK ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            left: desk ? (open ? "36%" : "50%") : "50%",
            bottom: desk ? 28 : 16,
            zIndex: 6,
            width: "min(430px,calc(100% - 24px))",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderRadius: 18,
            background: "rgba(26,25,40,.96)",
            border: `1px solid ${toastT.ln}`,
            boxShadow: `0 0 0 4px ${toastT.ring},0 20px 44px rgba(0,0,0,.55)`,
            boxSizing: "border-box",
            animation: rm ? "ymFade .2s both" : "ymToast .26s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <span
            style={{
              flex: "none",
              position: "relative",
              width: 42,
              height: 42,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              background: toastT.ibg,
              color: toastT.ifg,
            }}
          >
            <Icon n={toastT.icon} s={20} w={2.4} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
            <b style={{ fontSize: 15 }}>{toastT.title}</b>
            <span style={{ fontSize: 13, color: "var(--fg2)" }}>{toastT.msg}</span>
          </span>
          {toastT.cta ? (
            <button
              onClick={accept}
              style={{
                flex: "none",
                height: 38,
                padding: "0 13px",
                border: 0,
                borderRadius: 11,
                background: "#1A73E8",
                boxShadow: "0 3px 0 #174EA6",
                color: "#fff",
                font: "700 13.5px var(--fu)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Sign up
            </button>
          ) : null}
          <button
            onClick={() => setToastK(null)}
            aria-label="Dismiss"
            style={{ flex: "none", width: 32, height: 32, border: 0, borderRadius: 9, background: "transparent", color: "var(--fg3)", display: "grid", placeItems: "center", cursor: "pointer" }}
          >
            <Icon n="x" s={16} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
