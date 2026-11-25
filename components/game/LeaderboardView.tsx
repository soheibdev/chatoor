"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import RequireAuth from "@/components/layout/RequireAuth";
import { useChallenges, useLeaderBoard } from "@/lib/useData";
import { usePlayer } from "@/lib/usePlayer";
import useIsDesktop from "@/lib/useIsDesktop";
import { LAST_RANK, hue, initials, rank as rankOf, stateOf, tierFor, type Player } from "@/lib/game";

const METALS = ["var(--ag)", "var(--ss)", "var(--bz)"];
const METAL_HEX = ["#FBBC04", "#C4C7D4", "#D7925F"];

export default function LeaderboardView() {
  return (
    <RequireAuth gate="/leaderboard">
      <Leaderboard />
    </RequireAuth>
  );
}

function av(n: string) {
  const h = hue(n);
  return { avBg: `var(--${h}s)`, avFg: `var(--${h}t)`, ini: initials(n) };
}

function Leaderboard() {
  const desk = useIsDesktop();
  const router = useRouter();
  const { user } = useAuthUser();
  const { data: board } = useLeaderBoard();
  const { data: challenges } = useChallenges({});
  const [lbq, setLbq] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [pinned, setPinned] = useState(false);
  const [podW, setPodW] = useState(1000);
  const youRef = useRef<HTMLDivElement>(null);
  const podRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [listBox, setListBox] = useState({ left: 0, width: 0 });

  const players: Player[] = useMemo(() => board ?? [], [board]);
  const myId = user?.id ?? "";
  const R = useMemo(() => rankOf(players, myId), [players, myId]);
  const sorted = R.sorted;
  const me = players.find((p) => p.id === myId);
  const myPts = me?.points ?? 0;
  const myRank = me ? R.rank : players.length + 1;

  /* remember the rank so the Conquered overlay can show a delta next time */
  useEffect(() => {
    if (me) {
      try {
        localStorage.setItem(LAST_RANK, String(R.rank));
      } catch {
        /* private mode */
      }
    }
  }, [me, R.rank]);

  /* container query for the podium (< 400px stacks) */
  useEffect(() => {
    const el = podRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPodW(el.offsetWidth));
    ro.observe(el);
    setPodW(el.offsetWidth);
    return () => ro.disconnect();
  }, [lbq, players.length]);

  /* keep the pinned bar aligned with the list column */
  useEffect(() => {
    const read = () => {
      const el = listRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setListBox({ left: r.left, width: r.width });
    };
    read();
    window.addEventListener("resize", read);
    window.addEventListener("scroll", read, { passive: true });
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("scroll", read);
    };
  }, [desk, players.length, lbq]);

  /* pinned "you" bar when your row scrolls out of view */
  useEffect(() => {
    const el = youRef.current;
    if (!el) {
      setPinned(false);
      return;
    }
    const io = new IntersectionObserver((es) => setPinned(!es[0].isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [players.length, lbq, sort]);

  const lq = lbq.trim().toLowerCase();
  const rankMap = new Map(sorted.map((p, i) => [p.id, i + 1]));
  let list = sorted.filter((p) => !lq || p.nick_name.toLowerCase().includes(lq));
  if (sort === "asc") list = [...list].reverse();

  const rows = list.map((p) => {
    const rank = rankMap.get(p.id)!;
    const isMe = p.id === myId;
    const top10 = rank <= 10;
    const tier = tierFor(p.points);
    return {
      ...av(p.nick_name),
      id: p.id,
      rank,
      nick: p.nick_name,
      me: isMe,
      showTop: desk && top10 && rank > 3,
      pts: p.points.toLocaleString(),
      sub: isMe && R.above ? `${tier.name} · ${R.gap} pts to overtake @${R.above.nick_name}` : tier.name,
      pc: isMe ? "var(--Yt)" : "var(--fg)",
      bg: isMe ? "var(--Bs)" : "transparent",
      ring: isMe ? "inset 0 0 0 2px var(--B)" : "none",
      wrap:
        rank <= 3
          ? METALS[rank - 1]
          : top10
            ? "conic-gradient(var(--B) 0 25%, var(--R) 0 50%, var(--Y) 0 75%, var(--G) 0)"
            : rank <= 50
              ? "var(--fg2)"
              : "transparent",
    };
  });

  const showPodium = !lq && sorted.length >= 3;
  const stacked = podW > 0 && podW < 400;

  const P = [
    { i: 1, metal: METALS[1], label: "RUNNER-UP", h: desk ? 130 : 70, avS: desk ? 80 : 52, delay: "90ms", first: false },
    { i: 0, metal: METALS[0], label: "CHAMPION", h: desk ? 180 : 96, avS: desk ? 100 : 64, delay: "180ms", first: true },
    { i: 2, metal: METALS[2], label: "THIRD PLACE", h: desk ? 100 : 54, avS: desk ? 74 : 48, delay: "0ms", first: false },
  ];

  const podium = P.map((o) => {
    const p = sorted[o.i];
    return {
      ...o,
      ...av(p?.nick_name ?? ""),
      nick: p?.nick_name ?? "",
      pts: (p?.points ?? 0).toLocaleString(),
      rank: o.i + 1,
      avFs: desk ? (o.first ? 28 : 22) : 15,
      nFs: desk ? 17 : 13,
      ptFs: desk ? (o.first ? 26 : 20) : 14,
      rkFs: desk ? (o.first ? 64 : 46) : 26,
      crown: desk ? 36 : 22,
      ptC: o.first ? "var(--Yt)" : "var(--fg)",
      block: `color-mix(in oklab, ${METAL_HEX[o.i]} 14%, var(--s1))`,
      glow: o.first ? "0 0 44px rgba(251,188,4,.45)" : "0 0 0 0 transparent",
    };
  });

  /* "if accepted" projection */
  const pendingPts = (challenges ?? []).reduce(
    (s, c) => s + ((c.submissions || []).some((x) => x.status === "pending") && stateOf(c.submissions) !== "accepted" ? c.points : 0),
    0,
  );
  const projRank = pendingPts ? rankOf(players.map((p) => (p.id === myId ? { ...p, points: p.points + pendingPts } : p)), myId).rank : null;

  const nextAbovePts = sorted[R.rank] ? sorted[R.rank].points : 0;
  const gapPct = R.above
    ? Math.max(6, Math.min(100, Math.round(((myPts - nextAbovePts) / Math.max(1, R.above.points - nextAbovePts)) * 100))) + "%"
    : "100%";

  const pad = desk ? "32px 28px 120px" : "20px 16px 160px";
  const h1 = desk ? 44 : 28;
  const rowCols = desk ? "56px 44px minmax(0,1fr) auto 90px" : "40px 42px minmax(0,1fr) 0 64px";

  const hi = (nick: string) => {
    if (!lq) return nick;
    const i = nick.toLowerCase().indexOf(lq);
    if (i < 0) return nick;
    return (
      <>
        {nick.slice(0, i)}
        <mark style={{ background: "var(--Ys)", color: "var(--Yt)", borderRadius: 3, padding: "0 1px" }}>
          {nick.slice(i, i + lq.length)}
        </mark>
        {nick.slice(i + lq.length)}
      </>
    );
  };

  return (
    <>
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: pad, display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "var(--Gt)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--G)", animation: "ymPulse 1.6s infinite" }} />
              LIVE · SEASON 1
            </span>
            <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h1, letterSpacing: "-.025em" }}>Leaderboard</h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, flex: "1 1 420px", maxWidth: 600 }}>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "var(--fg3)" }}>PLAYERS</div>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 22, marginTop: 4 }}>{players.length}</div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "var(--fg3)" }}>POINTS</div>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 22, marginTop: 4 }}>
                {players.reduce((s, p) => s + p.points, 0).toLocaleString()}
              </div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "var(--Ys)", border: "1px solid rgba(251,188,4,.35)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "var(--Yt)" }}>TOP SCORE</div>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 22, marginTop: 4, color: "var(--Yt)" }}>
                {(sorted[0]?.points ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------- podium ------------------------------- */}
        {showPodium ? (
          <div
            ref={podRef}
            style={{
              borderRadius: 26,
              background: "var(--bg2)",
              border: "1px solid var(--ln)",
              padding: stacked ? "16px 12px 20px" : desk ? "40px 32px 0" : "20px 10px 0",
              display: stacked ? "flex" : "grid",
              flexDirection: stacked ? "column" : undefined,
              gridTemplateColumns: stacked ? undefined : "repeat(3,minmax(0,1fr))",
              gap: stacked ? 8 : desk ? 18 : 8,
              alignItems: stacked ? undefined : "end",
              justifyItems: stacked ? undefined : "center",
              boxSizing: "border-box",
            }}
          >
            {stacked ? (
              <>
                <div
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    background: "color-mix(in oklab,var(--ag) 14%,var(--s1))",
                    border: "1px solid var(--ag)",
                    boxShadow: "0 0 30px rgba(251,188,4,.18)",
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ position: "absolute", top: -2, left: 30, color: "var(--ag)" }}>
                    <Icon n="crown" s={22} f />
                  </span>
                  <span
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--fd)",
                      fontWeight: 800,
                      background: av(sorted[0].nick_name).avBg,
                      color: av(sorted[0].nick_name).avFg,
                      boxShadow: "0 0 0 3px var(--s1),0 0 0 5px var(--ag)",
                    }}
                  >
                    {av(sorted[0].nick_name).ini}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "var(--Yt)" }}>CHAMPION</span>
                    <b style={{ fontSize: 16 }}>{sorted[0].nick_name}</b>
                    <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--Yt)" }}>{sorted[0].points.toLocaleString()}</span>
                  </span>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 44, color: "var(--ag)" }}>1</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[1, 2].map((i) => {
                    const p = sorted[i];
                    const a = av(p.nick_name);
                    return (
                      <div
                        key={p.id}
                        style={{
                          borderRadius: 18,
                          background: "var(--s1)",
                          border: "1px solid var(--ln)",
                          borderTop: `3px solid ${METALS[i]}`,
                          padding: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              background: a.avBg,
                              color: a.avFg,
                              boxShadow: `0 0 0 2px var(--s1),0 0 0 4px ${METALS[i]}`,
                            }}
                          >
                            {a.ini}
                          </span>
                          <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 26, color: METALS[i] }}>{i + 1}</span>
                        </div>
                        <b style={{ fontSize: 13.5 }}>{p.nick_name}</b>
                        <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 14 }}>{p.points.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              podium.map((p) => (
                <div
                  key={p.rank}
                  style={{
                    width: "100%",
                    maxWidth: 260,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                    animation: `ymIn .32s cubic-bezier(.34,1.56,.64,1) both`,
                    animationDelay: p.delay,
                  }}
                >
                  {p.first ? (
                    <span style={{ color: "var(--ag)", filter: "drop-shadow(0 0 12px rgba(251,188,4,.6))" }}>
                      <Icon n="crown" s={p.crown} f />
                    </span>
                  ) : null}
                  <span
                    style={{
                      width: p.avS,
                      height: p.avS,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--fd)",
                      fontWeight: 800,
                      fontSize: p.avFs,
                      background: p.avBg,
                      color: p.avFg,
                      boxShadow: `0 0 0 3px var(--bg2),0 0 0 6px ${p.metal},${p.glow}`,
                    }}
                  >
                    {p.ini}
                  </span>
                  <b style={{ fontSize: p.nFs, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 4 }}>
                    {p.nick}
                  </b>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: p.ptFs, color: p.ptC }}>{p.pts}</span>
                  <div
                    style={{
                      width: "100%",
                      height: p.h,
                      borderRadius: "16px 16px 0 0",
                      background: p.block,
                      borderTop: `4px solid ${p.metal}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      paddingTop: 10,
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: p.rkFs, lineHeight: 1, color: p.metal }}>{p.rank}</span>
                    {desk ? (
                      <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em", color: "var(--fg2)", marginTop: 4 }}>{p.label}</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {/* ------------------------------- list ------------------------------- */}
        <div style={{ display: "grid", gridTemplateColumns: desk ? "minmax(0,1fr) 340px" : "minmax(0,1fr)", gap: 20, alignItems: "start" }}>
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <label
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  background: "var(--bg2)",
                  border: "1px solid var(--ln2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 14px",
                  color: "var(--fg3)",
                }}
              >
                <Icon n="search" s={18} />
                <input
                  aria-label="Search players"
                  value={lbq}
                  onChange={(e) => setLbq(e.target.value)}
                  placeholder="Search players by nickname"
                  style={{ flex: 1, minWidth: 0, height: "100%", border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 15px var(--fu)" }}
                />
                {lbq ? (
                  <button
                    aria-label="Clear search"
                    onClick={() => setLbq("")}
                    style={{ width: 30, height: 30, border: 0, borderRadius: 8, background: "var(--s2)", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                  >
                    <Icon n="x" s={14} />
                  </button>
                ) : null}
              </label>
              <button
                onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
                aria-label={sort === "desc" ? "Highest first" : "Lowest first"}
                style={{
                  whiteSpace: "nowrap",
                  height: 46,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid var(--ln2)",
                  background: "var(--s1)",
                  color: "var(--fg)",
                  font: "600 14px var(--fu)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <Icon n={sort === "desc" ? "arrow-down-wide-narrow" : "arrow-up-narrow-wide"} s={17} />
                {desk ? (sort === "desc" ? "Highest first" : "Lowest first") : null}
              </button>
            </div>

            <div role="list" style={{ borderRadius: 20, background: "var(--s1)", border: "1px solid var(--ln)", overflow: "hidden" }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  role="listitem"
                  ref={r.me ? youRef : undefined}
                  style={{
                    display: "grid",
                    gridTemplateColumns: rowCols,
                    alignItems: "center",
                    gap: 12,
                    height: 62,
                    padding: "0 16px",
                    borderBottom: "1px solid var(--ln)",
                    background: r.bg,
                    boxShadow: r.ring,
                  }}
                >
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 16 }}>#{r.rank}</span>
                  <span style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: r.wrap }}>
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12.5,
                        fontWeight: 700,
                        backgroundColor: "var(--s1)",
                        backgroundImage: `linear-gradient(${r.avBg},${r.avBg})`,
                        color: r.avFg,
                        boxShadow: "0 0 0 2px var(--s1)",
                      }}
                    >
                      {r.ini}
                    </span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{hi(r.nick)}</span>
                      {r.me ? (
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 7px", borderRadius: 6, background: "var(--btn)", color: "#fff" }}>
                          YOU
                        </span>
                      ) : null}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--fg3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</span>
                  </span>
                  <span>
                    {r.showTop ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          height: 26,
                          padding: "0 9px",
                          borderRadius: 8,
                          background: "var(--s2)",
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: "var(--fg2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Icon n="trending-up" s={13} />
                        TOP 10
                      </span>
                    ) : null}
                  </span>
                  <span style={{ textAlign: "end", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 16, color: r.pc }}>{r.pts}</span>
                </div>
              ))}
              {rows.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--fg2)", fontSize: 14.5 }}>
                  No player called “{lbq}”. Check the spelling or clear the search.
                </div>
              ) : null}
            </div>

          </div>

          {/* --------------------------- your position --------------------------- */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                borderRadius: 22,
                background: "var(--s1)",
                border: "1px solid var(--B)",
                boxShadow: "0 0 0 4px var(--Bs)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: "var(--Bt)" }}>YOUR POSITION</span>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 56, lineHeight: 0.9 }}>#{myRank}</span>
                <span style={{ fontSize: 13.5, color: "var(--fg3)", paddingBottom: 5 }}>of {players.length}</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 21, color: "var(--Yt)" }}>
                  {myPts}
                  <span style={{ fontFamily: "var(--fu)", fontSize: 12.5, color: "var(--fg3)" }}> pts</span>
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 10 }}>
                  <span style={{ color: "var(--fg2)" }}>{R.above ? `Next: #${R.rank - 1} @${R.above.nick_name}` : "You hold the crown"}</span>
                  <b style={{ color: "var(--Yt)", whiteSpace: "nowrap" }}>{R.above ? `${R.gap} pts` : "Defend it"}</b>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--ln)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "var(--Y)", width: gapPct, transition: "width .5s cubic-bezier(.2,.8,.2,1)" }} />
                </div>
              </div>
              {pendingPts ? (
                <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 14, background: "var(--bg)" }}>
                  <Icon n="clock" s={17} style={{ color: "var(--Yt)", flex: "none" }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--fg2)" }}>
                    {pendingPts} pts are in review. If accepted you’d reach #{projRank}.
                  </span>
                </div>
              ) : null}
              <button
                onClick={() => {
                  router.push("/challenges");
                  window.scrollTo(0, 0);
                }}
                className="ym-press"
                style={{
                  height: 46,
                  border: 0,
                  borderRadius: 12,
                  background: "var(--btn)",
                  boxShadow: "0 3px 0 var(--btnd)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  font: "700 15px var(--fu)",
                  cursor: "pointer",
                  ["--base" as string]: "var(--btnd)",
                }}
              >
                <Icon n="swords" s={17} />
                Find a quest
              </button>
            </div>
          </aside>
        </div>
        {me ? (
          <PinnedYou
            show={pinned}
            rank={myRank}
            nick={me.nick_name}
            points={myPts}
            gap={R.gap}
            nextRank={R.above ? R.rank - 1 : null}
            desk={desk}
            box={listBox}
          />
        ) : null}
      </main>
    </>
  );
}

/** Pinned "you" bar: shown when your row scrolls out of view. Desktop sticks to the
 *  bottom of the list column, mobile sits above the tab bar (Screens 3 LB2). */
function PinnedYou({
  show,
  rank,
  nick,
  points,
  gap,
  nextRank,
  desk,
  box,
}: {
  show: boolean;
  rank: number;
  nick: string;
  points: number;
  gap: number;
  nextRank: number | null;
  desk: boolean;
  box: { left: number; width: number };
}) {
  const a = av(nick);
  return (
    <div
      aria-hidden={!show}
      style={{
        position: "fixed",
        left: desk ? box.left : 10,
        width: desk ? box.width : "calc(100% - 20px)",
        bottom: desk ? 20 : 86,
        zIndex: 25,
        pointerEvents: show ? "auto" : "none",
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(8px)",
        transition: "opacity .2s cubic-bezier(.2,.8,.2,1), transform .2s cubic-bezier(.2,.8,.2,1)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          background: "var(--s2)",
          border: "1px solid var(--B)",
          boxShadow: "0 0 0 3px var(--Bs),var(--sh)",
          padding: "10px 14px",
          display: "grid",
          gridTemplateColumns: "40px 36px minmax(0,1fr) auto",
          alignItems: "center",
          gap: 10,
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 15 }}>#{rank}</span>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 700,
            background: a.avBg,
            color: a.avFg,
          }}
        >
          {a.ini}
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <b style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            You
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--btn)", color: "#fff" }}>YOU</span>
          </b>
          <span style={{ fontSize: 11.5, color: "var(--Yt)", fontWeight: 700 }}>
            {nextRank ? `${gap} pts to #${nextRank}` : "You hold the crown"}
          </span>
        </span>
        <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15, color: "var(--Yt)" }}>{points}</span>
      </div>
    </div>
  );
}

/* small shim so this file only imports what it needs from the auth context */
function useAuthUser() {
  const { user } = usePlayer();
  return { user };
}
