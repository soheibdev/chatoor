"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Footer from "@/components/layout/Footer";
import Makers from "./Makers";
import RegisterSlideOver from "./RegisterSlideOver";
import DevShirtCTA from "@/app/(landing)/components/DevShirtCTA";
import { useAuth } from "@/app/AuthContext";
import { usePlayer } from "@/lib/usePlayer";
import useIsDesktop from "@/lib/useIsDesktop";
import { TIERS, tierFor } from "@/lib/game";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

type TrackDef = {
  short: string;
  name: string;
  icon: string;
  k: "B" | "R" | "G";
  desc: string;
  sub: string;
  subIcon: string;
  cta: string;
  type: string;
};

const TRACKS: TrackDef[] = [
  {
    short: "PS", name: "Problem Solving", icon: "code-xml", k: "B",
    desc: "Algorithms and data structures, from warm-ups to graph monsters. Push your solution to GitHub and send the link.",
    sub: "github.com/you/solution", subIcon: "github", cta: "Browse PS quests", type: "ps",
  },
  {
    short: "CTF", name: "Cybersecurity", icon: "shield", k: "R",
    desc: "Web, forensics, crypto and more. Break in, find the hidden string and capture the flag.",
    sub: "gdgbatna{…}", subIcon: "flag", cta: "Browse CTF quests", type: "ctf",
  },
  {
    short: "AI", name: "AI / ML", icon: "brain", k: "G",
    desc: "Train, evaluate and ship models on real datasets. Share your notebook from Colab or GitHub.",
    sub: "colab.research.google.com/…", subIcon: "notebook-pen", cta: "Browse AI/ML quests", type: "ai",
  },
];

const FEATURES = [
  { icon: "swords", t: "Real challenges", d: "Problems written by the club, not copied from a textbook." },
  { icon: "trophy", t: "Live leaderboard", d: "Every accepted solve moves you up the board." },
  { icon: "users", t: "Peer community", d: "Stuck? The Discord has your back." },
  { icon: "calendar-days", t: "Weekly drops", d: "Fresh quests every week of the season." },
  { icon: "book-open", t: "Curated resources", d: "Courses, docs and videos in English and Arabic." },
  { icon: "rocket", t: "Level up", d: "Go from Rookie to Legend as your points stack up." },
];

const OLD_WAY = ["Endless tutorials", "Tutorial hell", "Learning alone", "Nothing to show for it"];
const NEW_WAY = ["Build real projects", "Portfolio-ready repos", "A club that has your back", "Points, ranks and bragging rights"];

export default function Landing() {
  const desk = useIsDesktop();
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { points } = usePlayer();
  const authed = !!user;
  const [join, setJoin] = useState(false);

  useEffect(() => setJoin(params.get("join") === "1"), [params]);

  const openJoin = useCallback(() => {
    setJoin(true);
    const u = new URL(window.location.href);
    u.searchParams.set("join", "1");
    window.history.replaceState(null, "", u.toString());
  }, []);

  const closeJoin = useCallback(() => {
    setJoin(false);
    const u = new URL(window.location.href);
    u.searchParams.delete("join");
    window.history.replaceState(null, "", u.pathname + (u.search || ""));
  }, []);

  const days = Math.max(0, Math.ceil((Date.parse("2026-12-10T00:00:00") - Date.now()) / 864e5));
  const myTier = authed ? tierFor(points).index : -1;

  const heroGo = () => {
    if (authed) {
      router.push("/challenges");
      window.scrollTo(0, 0);
    } else openJoin();
  };

  const trackGo = (type: string) => () => {
    if (!authed) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/challenges?type=" + type)}`);
      return;
    }
    router.push(`/challenges?type=${type}`);
    window.scrollTo(0, 0);
  };

  /* ---------- geometry, verbatim from homeVals() ---------- */
  const heroPad = desk ? "72px 28px 88px" : "32px 16px 48px";
  const heroGap = desk ? 56 : 28;
  const heroFs = desk ? "clamp(56px, 7vw, 88px)" : "48px";
  const heroP = desk ? 20 : 16.5;
  const dateFs = desk ? 32 : 22;
  const secPad = desk ? "96px 28px 88px" : "48px 16px 48px";
  const secPad2 = desk ? "0 28px 88px" : "0 16px 48px";
  const h2Fs = desk ? 44 : 28;
  const bannerPad = desk ? 48 : 24;

  return (
    <>
      <main style={{ display: "flex", flexDirection: "column", paddingBottom: desk ? 0 : 70 }}>
        {/* ----------------------------- HERO ----------------------------- */}
        <section style={{ position: "relative", overflow: "hidden" }}>
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: -120, bottom: -160, width: 700, height: 420, opacity: 0.1, pointerEvents: "none" }}
          >
            <span style={{ position: "absolute", left: 0, top: 180, width: 300, height: 72, borderRadius: 36, background: "var(--R)", transform: "rotate(-30deg)", transformOrigin: "36px 36px" }} />
            <span style={{ position: "absolute", left: 0, top: 180, width: 300, height: 72, borderRadius: 36, background: "var(--B)", transform: "rotate(30deg)", transformOrigin: "36px 36px" }} />
          </div>
          <div
            style={{
              position: "relative",
              maxWidth: 1280,
              margin: "0 auto",
              padding: heroPad,
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
              gap: heroGap,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
              <span
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 36,
                  padding: "0 14px 0 12px",
                  borderRadius: 999,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--G)", animation: "ymPulse 1.6s infinite" }} />
                Registration open · Season 1 starts Dec 10
              </span>
              <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: heroFs, lineHeight: 0.98, letterSpacing: "-.035em" }}>
                <span style={{ color: "var(--Bt)" }}>Code</span> it.
                <br />
                <span style={{ color: "var(--Rt)" }}>Hack</span> it.
                <br />
                <span style={{ color: "var(--Gt)" }}>Train</span> it.
              </h1>
              <p style={{ margin: 0, maxWidth: 560, fontSize: heroP, lineHeight: 1.55, color: "var(--fg2)", textWrap: "pretty" }}>
                Weekly Problem Solving, Cybersecurity and AI/ML challenges for GDGC Batna members. Earn points, level up and fight for
                the <span style={{ color: "var(--Yt)", fontWeight: 700 }}>#1 spot</span>.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button
                  onClick={heroGo}
                  className="ym-press"
                  style={{
                    height: 56,
                    padding: "0 24px",
                    border: 0,
                    borderRadius: 14,
                    background: "var(--btn)",
                    boxShadow: "0 4px 0 var(--btnd)",
                    color: "#fff",
                    font: "700 17px var(--fu)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    ["--base" as string]: "var(--btnd)",
                  }}
                >
                  <Icon n={authed ? "swords" : "gamepad-2"} s={20} />
                  {authed ? "Continue to challenges" : "Join the arena"}
                </button>
                <a
                  href="#tracks"
                  style={{
                    height: 56,
                    padding: "0 22px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 14,
                    background: "var(--s1)",
                    border: "1px solid var(--ln2)",
                    color: "var(--fg)",
                    fontWeight: 600,
                    fontSize: 17,
                  }}
                >
                  Explore tracks
                  <Icon n="arrow-right" s={18} />
                </a>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 4 }}>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 32 }}>50+</div>
                  <div style={{ fontSize: 14, color: "var(--fg3)", marginTop: 4 }}>challenges</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 32 }}>200+</div>
                  <div style={{ fontSize: 14, color: "var(--fg3)", marginTop: 4 }}>members</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 32, color: "var(--Yt)" }}>Free</div>
                  <div style={{ fontSize: 14, color: "var(--fg3)", marginTop: 4 }}>for club members</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              <div
                style={{
                  borderRadius: 24,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  boxShadow: "var(--sh)",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon n="calendar-days" s={18} style={{ color: "var(--fg3)" }} />
                  <b>Season 1 · Dev Challenges</b>
                  <span
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 28,
                      padding: "0 10px",
                      borderRadius: 8,
                      background: "var(--Bs)",
                      color: "var(--Bt)",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    <Icon n="globe" s={14} />
                    Online
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", alignItems: "center", gap: 18 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--fg3)" }}>STARTS</div>
                    <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: dateFs, marginTop: 4 }}>Dec 10</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, height: 8 }}>
                    {COLS.map((c) => (
                      <span key={c} style={{ flex: 1, borderRadius: 4, background: c }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--fg3)" }}>ENDS</div>
                    <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: dateFs, marginTop: 4 }}>Jan 10</div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "var(--bg)",
                  }}
                >
                  <Icon n="calendar-clock" s={20} style={{ color: "var(--Yt)" }} />
                  <span style={{ color: "var(--fg2)" }}>{days > 0 ? "Kick-off in" : "Season is"}</span>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 22, color: "var(--Yt)" }}>
                    {days > 0 ? `${days} days` : "live"}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--fg3)" }}>New quests every week</span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 24,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <b>Your climb</b>
                  <span style={{ fontSize: 13, color: "var(--fg3)" }}>
                    {authed ? `You: ${tierFor(points).name} · ${points} pts` : "tiers unlock with points"}
                  </span>
                </div>
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
                  <span style={{ position: "absolute", left: "12%", right: "12%", top: 23, height: 2, background: "var(--ln2)" }} />
                  {TIERS.map((t, i) => {
                    const icon = ["sprout", "terminal", "rocket", "crown"][i];
                    const frame = i === myTier ? "var(--B)" : i === 3 ? "var(--Y)" : "var(--ln2)";
                    const ic = i === 3 ? "var(--Yt)" : "var(--fg)";
                    const glow = i === myTier ? "0 0 0 4px var(--Bs)" : i === 3 ? "0 0 20px rgba(251,188,4,.35)" : "none";
                    return (
                      <div key={t.key} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            display: "grid",
                            placeItems: "center",
                            background: "var(--s2)",
                            border: `2px solid ${frame}`,
                            color: ic,
                            boxShadow: glow,
                          }}
                        >
                          <Icon n={icon} s={22} />
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                        <span style={{ fontFamily: "var(--fm)", fontSize: 11.5, color: "var(--fg3)" }}>{t.min} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------- THE MAKERS -------------------------- */}
        <div style={{ width: "100%" }}>
          <Makers onAccept={heroGo} />
        </div>

        {/* ----------------------------- TRACKS ----------------------------- */}
        <section
          id="tracks"
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: secPad,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 32,
            scrollMarginTop: 80,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 14, color: "var(--fg3)" }}>&lt;tracks/&gt;</span>
            <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h2Fs, letterSpacing: "-.02em", lineHeight: 1.08 }}>
              Three tracks. One leaderboard.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 18 }}>
            {TRACKS.map((t) => (
              <button
                key={t.short}
                onClick={trackGo(t.type)}
                className="ym-card"
                style={{
                  textAlign: "start",
                  padding: 0,
                  borderRadius: 24,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  color: "var(--fg)",
                  fontFamily: "var(--fu)",
                  cursor: "pointer",
                  transition: "transform .2s cubic-bezier(.2,.8,.2,1), border-color .2s, box-shadow .2s",
                  ["--tc" as string]: `var(--${t.k})`,
                  ["--glow" as string]: `0 14px 36px -12px color-mix(in oklab, var(--${t.k}) 55%, transparent)`,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 130,
                    background: `var(--${t.k}s)`,
                    padding: 22,
                    boxSizing: "border-box",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{ width: 54, height: 54, borderRadius: 16, display: "grid", placeItems: "center", background: `var(--${t.k})`, color: "#fff" }}
                  >
                    <Icon n={t.icon} s={27} />
                  </span>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 64, lineHeight: 0.9, color: `var(--${t.k}t)` }}>
                    {t.short}
                  </span>
                </div>
                <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, flex: 1, width: "100%", boxSizing: "border-box" }}>
                  <span style={{ fontSize: 21, fontWeight: 700 }}>{t.name}</span>
                  <span style={{ fontSize: 15, lineHeight: 1.55, color: "var(--fg2)", flex: 1 }}>{t.desc}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "var(--fg3)", marginTop: 4 }}>YOU SUBMIT</span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 10,
                      background: "var(--bg)",
                      fontFamily: "var(--fm)",
                      fontSize: 13,
                      color: `var(--${t.k}t)`,
                    }}
                  >
                    <Icon n={t.subIcon} s={16} />
                    {t.sub}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 14, fontWeight: 700, color: `var(--${t.k}t)` }}>
                    {t.cta}
                    <Icon n="arrow-right" s={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ---------------------------- FEATURES ---------------------------- */}
        <section
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: secPad2,
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 14, color: "var(--fg3)" }}>&lt;features/&gt;</span>
            <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h2Fs, lineHeight: 1.08, letterSpacing: "-.02em" }}>
              Built like a game. Made for the club.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: 14 }}>
            {FEATURES.map((x) => (
              <div
                key={x.t}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--s2)" }}>
                  <Icon n={x.icon} s={22} />
                </span>
                <b style={{ fontSize: 17 }}>{x.t}</b>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--fg2)" }}>{x.d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------- WHY ------------------------------- */}
        <section
          style={{
            maxWidth: 1080,
            width: "100%",
            margin: "0 auto",
            padding: secPad2,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
            <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 14, color: "var(--fg3)" }}>&lt;why/&gt;</span>
            <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h2Fs, letterSpacing: "-.02em", lineHeight: 1.08 }}>
              Why developers choose us
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 18 }}>
            <div
              style={{
                padding: 28,
                borderRadius: 24,
                background: "var(--bg2)",
                border: "1px solid var(--ln)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--fg2)" }}>
                <Icon n="book-marked" s={20} />
                <b style={{ fontSize: 19 }}>Traditional learning</b>
              </div>
              {OLD_WAY.map((x) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, color: "var(--fg3)" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--s1)" }}>
                    <Icon n="x" s={15} w={2.5} />
                  </span>
                  {x}
                </div>
              ))}
            </div>
            <div
              style={{
                padding: 28,
                borderRadius: 24,
                background: "var(--s1)",
                border: "1px solid var(--Y)",
                boxShadow: "0 0 0 4px var(--Ys)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon n="swords" s={20} style={{ color: "var(--Yt)" }} />
                <b style={{ fontSize: 19 }}>The DevChallenges way</b>
              </div>
              {NEW_WAY.map((x) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--G)", color: "#fff" }}>
                    <Icon n="check" s={15} w={3} />
                  </span>
                  {x}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------- QUEST BANNER --------------------------- */}
        {/* extra top padding on desktop so the mascot's head clears the section above */}
        <section
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: desk ? "96px 28px 88px" : secPad2,
            boxSizing: "border-box",
          }}
        >
          <DevShirtCTA
            href={authed ? "/challenges" : `/login?callbackUrl=${encodeURIComponent("/challenges")}`}
            h2Fs={h2Fs}
            bannerPad={bannerPad}
          />
        </section>

        <Footer />
      </main>

      <RegisterSlideOver open={join} onClose={closeJoin} />
    </>
  );
}
