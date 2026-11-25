"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/app/AuthContext";
import { usePlayer } from "@/lib/usePlayer";
import { readTheme, toggleTheme, type Theme } from "@/lib/theme";
import { T } from "@/components/ui/toast";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

export type NavMode = "desktop" | "mobile" | "tabbar";

const DEFS: [string, string, string, string][] = [
  ["/", "Home", "house", "Home"],
  ["/challenges", "Challenges", "swords", "Quests"],
  ["/leaderboard", "Leaderboard", "trophy", "Ranks"],
  ["/resources", "Resources", "book-open", "Learn"],
  ["/community", "Community", "users", "Club"],
];

const PROTECTED: Record<string, string> = {
  "/challenges": "Challenges",
  "/leaderboard": "the Leaderboard",
};

function Stripe({ h = 3 }: { h?: number }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", height: h }}>
      {COLS.map((c) => (
        <span key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

export default function Navbar({ mode, active }: { mode: NavMode; active: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { points, rank, tier, avBg, avFg, ini, nick, email, loading } = usePlayer();
  const guest = !user;
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setTheme(readTheme()), []);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Fullscreen shortcut (F), ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "f" || e.key === "F") void fullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* denied */
    }
  }

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (PROTECTED[href] && guest) {
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
    window.scrollTo(0, 0);
  };

  const links = DEFS.filter(([href]) => mode === "tabbar" || href !== "/").map(([href, label, icon, short]) => {
    const on = href === active;
    return {
      href,
      label,
      icon,
      short,
      on,
      fg: on ? "var(--fg)" : "var(--fg2)",
      bar: on ? "flex" : "none",
      cur: on ? ("page" as const) : undefined,
      pill: on ? "var(--Bs)" : "transparent",
      ic: on ? "var(--Bt)" : "var(--fg3)",
    };
  });

  const onTheme = () => setTheme(toggleTheme());
  const themeIcon = theme === "light" ? "moon" : "sun";

  const doLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    await logout();
    router.push("/");
    window.scrollTo(0, 0);
    T.loggedOut();
  };

  /* ------------------------------- tab bar ------------------------------- */
  if (mode === "tabbar") {
    return (
      <nav
        aria-label="Main"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,minmax(0,1fr))",
          height: 70,
          padding: "6px 6px 10px",
          background: "var(--bg2)",
          borderTop: "1px solid var(--ln)",
          fontFamily: "var(--fu)",
        }}
      >
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={go(l.href)}
            aria-current={l.cur}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minHeight: 44,
              color: l.fg,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: l.pill,
                color: l.ic,
              }}
            >
              <Icon n={l.icon} s={19} />
            </span>
            {l.short}
          </a>
        ))}
      </nav>
    );
  }

  /* ------------------------------- mobile ------------------------------- */
  if (mode === "mobile") {
    return (
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          height: 60,
          padding: "0 16px",
          background: "var(--bg)",
          borderBottom: "1px solid var(--ln)",
          fontFamily: "var(--fu)",
          color: "var(--fg)",
        }}
      >
        <Link
          href="/"
          aria-label="CHATOOOR home"
          style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, color: "var(--fg)" }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", display: "grid", placeItems: "center" }}>
            <Image src="/assets/gdgc-mark.png" alt="GDGC logo" width={1360} height={719} style={{ width: 25, height: "auto", display: "block" }} />
          </span>
          <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 16 }}>CHATOOOR</span>
        </Link>
        <span style={{ marginLeft: "auto" }} />
        {guest ? (
          <>
            <a
              href="/register"
              onClick={go("/register")}
              style={{
                height: 40,
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                background: "var(--btn)",
                boxShadow: "0 3px 0 var(--btnd)",
              }}
            >
              Join
            </a>
            <button
              aria-label="Log in"
              onClick={() => router.push("/login")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid var(--ln)",
                background: "transparent",
                color: "var(--fg)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <Icon n="log-in" s={19} />
            </button>
          </>
        ) : (
          <>
            {loading ? (
              <span className="ym-skel" style={{ width: 62, height: 34, borderRadius: 10 }} />
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  height: 34,
                  padding: "0 10px",
                  borderRadius: 10,
                  background: "var(--Ys)",
                  color: "var(--Yt)",
                  fontFamily: "var(--fd)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <Icon n="zap" s={13} f />
                {points}
              </span>
            )}
            <div style={{ position: "relative" }} ref={box}>
              <button
                aria-label="Player menu"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                style={{
                  position: "relative",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid var(--ln)",
                  background: "var(--s1)",
                  display: "grid",
                  placeItems: "center",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    background: avBg,
                    color: avFg,
                  }}
                >
                  {ini}
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 9,
                    background: "var(--fg)",
                    color: "var(--bg)",
                    fontSize: 10,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  #{rank}
                </span>
              </button>
              {open ? (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 54,
                    zIndex: 6,
                    width: 250,
                    borderRadius: 16,
                    background: "var(--s1)",
                    border: "1px solid var(--ln2)",
                    boxShadow: "var(--sh)",
                    overflow: "hidden",
                  }}
                >
                  <Stripe />
                  <div
                    style={{
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      borderBottom: "1px solid var(--ln)",
                    }}
                  >
                    <b style={{ fontSize: 15 }}>{nick}</b>
                    <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>
                      {tier.name} · #{rank} · {tier.next ? `${tier.toNext} pts to ${tier.next.name}` : "Max tier"}
                    </span>
                    <span style={{ height: 6, borderRadius: 3, background: "var(--ln)", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", background: "var(--Y)", width: `${tier.pct}%` }} />
                    </span>
                  </div>
                  <div style={{ padding: 6 }}>
                    <a
                      href="#"
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        onTheme();
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 10px", borderRadius: 10, fontSize: 14 }}
                    >
                      <Icon n={themeIcon} s={16} />
                      Switch theme
                    </a>
                    <a
                      href="#"
                      role="menuitem"
                      onClick={doLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        height: 44,
                        padding: "0 10px",
                        borderRadius: 10,
                        fontSize: 14,
                        color: "var(--Rt)",
                      }}
                    >
                      <Icon n="log-out" s={16} />
                      Log out
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </header>
    );
  }

  /* ------------------------------- desktop ------------------------------- */
  return (
    <header
      style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 28,
        height: 68,
        padding: "0 28px",
        background: "var(--bg)",
        borderBottom: "1px solid var(--ln)",
        fontFamily: "var(--fu)",
        color: "var(--fg)",
      }}
    >
      <Link href="/" aria-label="CHATOOOR home" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--fg)" }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#fff",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 0 0 1px var(--ln)",
          }}
        >
          <Image src="/assets/gdgc-mark.png" alt="GDGC logo" width={1360} height={719} style={{ width: 28, height: "auto", display: "block" }} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 17, letterSpacing: "-.01em" }}>CHATOOOR</span>
          <span style={{ fontFamily: "var(--fm)", fontSize: 10.5, color: "var(--fg3)", marginTop: 5 }}>GDGC · Batna</span>
        </span>
      </Link>

      <nav aria-label="Main" style={{ display: "flex", gap: 2 }}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={go(l.href)}
            aria-current={l.cur}
            className="ym-navlink"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: l.fg,
            }}
          >
            <Icon n={l.icon} s={17} />
            {l.label}
            <span
              aria-hidden="true"
              style={{ position: "absolute", left: 14, right: 14, bottom: -14, height: 3, gap: 2, display: l.bar }}
            >
              {COLS.map((c) => (
                <span key={c} style={{ flex: 1, borderRadius: 2, background: c }} />
              ))}
            </span>
          </a>
        ))}
      </nav>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button
          aria-label="Toggle theme"
          onClick={onTheme}
          className="ym-iconbtn"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "1px solid var(--ln)",
            background: "transparent",
            color: "var(--fg2)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon n={themeIcon} s={18} />
        </button>
        <button
          aria-label="Fullscreen (F)"
          onClick={fullscreen}
          className="ym-iconbtn"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "1px solid var(--ln)",
            background: "transparent",
            color: "var(--fg2)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon n="maximize" s={18} />
        </button>

        {guest ? (
          <>
            <a
              href="/login"
              onClick={go("/login")}
              className="ym-ghost"
              style={{
                whiteSpace: "nowrap",
                height: 40,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                color: "var(--fg)",
              }}
            >
              Log in
            </a>
            <a
              href="/register"
              onClick={go("/register")}
              style={{
                whiteSpace: "nowrap",
                height: 40,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                background: "var(--btn)",
                boxShadow: "0 3px 0 var(--btnd)",
              }}
            >
              <Icon n="gamepad-2" s={18} />
              Join the arena
            </a>
          </>
        ) : (
          <div style={{ position: "relative" }} ref={box}>
            <button
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="ym-playercard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 50,
                padding: "0 10px 0 6px",
                borderRadius: 14,
                background: "var(--s1)",
                border: "1px solid var(--ln)",
                color: "var(--fg)",
                cursor: "pointer",
                fontFamily: "var(--fu)",
              }}
            >
              {loading ? (
                <span className="ym-skel" style={{ width: 64, height: 36, borderRadius: 10 }} />
              ) : (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: 36,
                    padding: "0 10px",
                    borderRadius: 10,
                    background: "var(--Ys)",
                    color: "var(--Yt)",
                    fontFamily: "var(--fd)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <Icon n="zap" s={14} f />
                  {points}
                </span>
              )}
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  background: avBg,
                  color: avFg,
                }}
              >
                {ini}
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minWidth: 96 }}>
                <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>{nick}</span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--fg3)", lineHeight: 1 }}
                >
                  <span style={{ display: "flex", gap: 2 }}>
                    {COLS.map((c, i) => (
                      <span
                        key={i}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: i < tier.pips ? c : "var(--ln2)" }}
                      />
                    ))}
                  </span>
                  {tier.name} · #{rank}
                </span>
                <span style={{ width: "100%", height: 3, borderRadius: 2, background: "var(--ln)", overflow: "hidden" }}>
                  <span
                    style={{ display: "block", height: "100%", borderRadius: 2, background: "var(--Y)", width: `${tier.pct}%` }}
                  />
                </span>
              </span>
              <Icon n="chevron-down" s={16} style={{ color: "var(--fg3)" }} />
            </button>

            {open ? (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 58,
                  width: 300,
                  borderRadius: 18,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  boxShadow: "var(--sh)",
                  overflow: "hidden",
                  zIndex: 6,
                }}
              >
                <Stripe />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: 17,
                        background: avBg,
                        color: avFg,
                      }}
                    >
                      {ini}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{nick}</span>
                      <span style={{ fontSize: 13, color: "var(--fg3)" }}>{email}</span>
                    </span>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "var(--s2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ fontWeight: 700 }}>{tier.name}</span>
                      <span style={{ color: "var(--fg3)" }}>
                        {tier.next ? `${tier.toNext} pts to ${tier.next.name}` : "Max tier"}
                      </span>
                    </div>
                    <span style={{ height: 6, borderRadius: 3, background: "var(--ln)", overflow: "hidden" }}>
                      <span
                        style={{ display: "block", height: "100%", borderRadius: 3, background: "var(--Y)", width: `${tier.pct}%` }}
                      />
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--ln)" }}>
                      <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                        Rank
                      </div>
                      <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 20, marginTop: 4 }}>#{rank}</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--ln)" }}>
                      <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                        Points
                      </div>
                      <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 20, marginTop: 4, color: "var(--Yt)" }}>
                        {points}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--ln)", padding: 6 }}>
                  <a
                    href="/challenges"
                    role="menuitem"
                    onClick={go("/challenges")}
                    className="ym-menuitem"
                    style={{ display: "flex", alignItems: "center", gap: 10, height: 40, padding: "0 12px", borderRadius: 10, fontSize: 14, color: "var(--fg)" }}
                  >
                    <Icon n="swords" s={16} />
                    My challenges
                  </a>
                  <a
                    href="#"
                    role="menuitem"
                    onClick={doLogout}
                    className="ym-menuitem-danger"
                    style={{ display: "flex", alignItems: "center", gap: 10, height: 40, padding: "0 12px", borderRadius: 10, fontSize: 14, color: "var(--Rt)" }}
                  >
                    <Icon n="log-out" s={16} />
                    Log out
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}

export { Stripe };
