"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import QuestCard from "./QuestCard";
import SubmissionModal from "./SubmissionModal";
import ConqueredOverlay, { type Celebration } from "./ConqueredOverlay";
import RequireAuth from "@/components/layout/RequireAuth";
import { useChallenges } from "@/lib/useData";
import { usePlayer } from "@/lib/usePlayer";
import useIsDesktop from "@/lib/useIsDesktop";
import {
  LAST_RANK, SEEN_WINS, TRACK, stateOf, streakOf, tierFor,
  type Challenge, type TrackKey,
} from "@/lib/game";

const DIFFS: [string, string, number][] = [
  ["all", "All levels", 0],
  ["easy", "Easy", 1],
  ["medium", "Medium", 2],
  ["hard", "Hard", 3],
];

export default function ChallengesView() {
  return (
    <RequireAuth gate="/challenges">
      <Challenges />
    </RequireAuth>
  );
}

function Challenges() {
  const desk = useIsDesktop();
  const params = useSearchParams();
  const qc = useQueryClient();
  const { points, rank, above, gap, ranked } = usePlayer();

  const [track, setTrack] = useState<string>(params.get("type") || "all");
  const [diff, setDiff] = useState<string>(params.get("difficulty") || "all");
  const [q, setQ] = useState(params.get("search") || "");
  const [debounced, setDebounced] = useState(q);
  const [page, setPage] = useState(Number(params.get("page") || 1));
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sel, setSel] = useState<string | null>(null);
  const [cel, setCel] = useState<Celebration | null>(null);
  const [local, setLocal] = useState<Record<string, Challenge>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  /* search debounce, 250ms */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  /* filters mirrored in the URL */
  useEffect(() => {
    const u = new URLSearchParams();
    if (track !== "all") u.set("type", track);
    if (diff !== "all") u.set("difficulty", diff);
    if (debounced) u.set("search", debounced);
    if (page > 1) u.set("page", String(page));
    const qs = u.toString();
    window.history.replaceState(null, "", "/challenges" + (qs ? `?${qs}` : ""));
  }, [track, diff, debounced, page]);

  /* `/` focuses the search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "/" || sel) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const { data, isLoading, isFetching, isError, refetch, pageCount } = useChallenges({
    type: track !== "all" ? track : undefined,
    difficulty: diff !== "all" ? diff : undefined,
    search: debounced || undefined,
    page,
  });

  const challenges = useMemo(
    () => (data ?? []).map((c) => local[c.id] ?? c),
    [data, local],
  );

  /* The API may ignore params; filter client-side too so counts and results always agree. Inactive challenges are strictly hidden from participants. */
  const qq = debounced.trim().toLowerCase();
  const pool = challenges.filter(
    (c) =>
      c.isActive !== false &&
      (!qq ||
        [c.title, c.subtitle, c.description, c.type, TRACK[c.type]?.label].join(" ").toLowerCase().includes(qq)) &&
      (diff === "all" || c.difficulty === diff),
  );
  const filtered = pool.filter((c) => track === "all" || c.type === track);

  /* celebration budget: only real, unseen wins */
  useEffect(() => {
    if (!challenges.length) return;
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_WINS) || "[]");
    } catch {
      seen = [];
    }
    const win = challenges.find((c) => (c.submissions || []).some((s) => s.status === "accepted") && !seen.includes(c.id));
    if (!win) return;
    const t1 = tierFor(points);
    const lastRaw = localStorage.getItem(LAST_RANK);
    const before = lastRaw ? Number(lastRaw) : null;
    setCel({
      caps: win.title.toUpperCase(),
      pts: (win.submissions || []).find((s) => s.status === "accepted")?.points ?? win.points,
      before: before && before !== rank ? before : null,
      after: rank,
      up: !!before && before > rank,
      diff: before ? before - rank : 0,
      tierLine: t1.next ? `${t1.name.toUpperCase()} → ${t1.next.name.toUpperCase()}` : "LEGEND",
      toGo: t1.next ? `${t1.toNext} TO GO` : "MAX",
      pct: t1.pct + "%",
    });
    try {
      localStorage.setItem(SEEN_WINS, JSON.stringify([...seen, win.id]));
      localStorage.setItem(LAST_RANK, String(rank));
    } catch {
      /* private mode */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges.length]);

  const onSubmitted = useCallback(
    (c: Challenge, value: string) => {
      const field = c.type === "ctf" ? "flag" : "link";
      setLocal((s) => ({
        ...s,
        [c.id]: {
          ...c,
          submissions: [
            ...(Array.isArray(c.submissions) ? c.submissions : []),
            { status: "pending", points: 0, [field]: value, created_at: "just" },
          ],
        },
      }));
      void qc.invalidateQueries({ queryKey: ["challange"] });
    },
    [qc],
  );

  const current = sel ? challenges.find((c) => c.id === sel) ?? null : null;

  /* ---------------- derived header values ---------------- */
  const ring = (label: string, icon: string, t: TrackKey, key: string) => {
    const all = challenges.filter((c) => c.type === t);
    const a = all.filter((c) => stateOf(c.submissions) === "accepted").length;
    const b = all.length;
    const p = b ? Math.round((a / b) * 100) : 0;
    return {
      k: label,
      icon,
      v: `${a}/${b}`,
      c: `var(--${key}t)`,
      bg: `conic-gradient(var(--${key}) 0 ${p}%, var(--ln) ${p}% 100%)`,
      aria: `${label}: ${a} of ${b} solved`,
    };
  };
  const rings = [ring("PS", "code-xml", "ps", "B"), ring("CTF", "shield", "ctf", "R"), ring("AI/ML", "brain", "ai", "G")];

  const tab = (id: string, label: string, icon: string, key?: string) => {
    const on = track === id;
    return {
      id,
      label,
      icon,
      n: pool.filter((c) => id === "all" || c.type === id).length,
      sel: on,
      bg: on ? (key ? `var(--${key}s)` : "var(--s2)") : "transparent",
      fg: key ? `var(--${key}t)` : "var(--fg)",
      cbg: key ? `var(--${key}s)` : "var(--ln2)",
    };
  };
  const trackTabs = [tab("all", "All", "layout-grid"), tab("ps", "PS", "code-xml", "B"), tab("ctf", "CTF", "shield", "R"), tab("ai", "AI/ML", "brain", "G")];

  const onTable = filtered.reduce((s, c) => s + (stateOf(c.submissions) === "accepted" ? 0 : c.points), 0);
  const nextLine = ranked && above ? `You’re #${rank}. Next rank in ${gap} pts.` : "You’re #1. Defend your crown.";
  const streak = streakOf(challenges);

  const listView = desk && layout === "list";
  const pad = desk ? "32px 28px 120px" : "20px 16px 160px";
  const h1 = desk ? 44 : 28;

  const clearAll = () => {
    setQ("");
    setTrack("all");
    setDiff("all");
    setPage(1);
  };

  return (
    <>
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: pad, display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }}>
        {/* ------------------------------ header ------------------------------ */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--fg3)" }}>&lt;challenges/&gt;</span>
            <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h1, letterSpacing: "-.025em", lineHeight: 1.05 }}>
              Challenges library
            </h1>
            <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15.5, color: "var(--fg2)" }}>{nextLine}</span>
              {streak > 0 ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 8,
                    background: "var(--Ys)",
                    color: "var(--Yt)",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  🔥 {streak}-day streak
                </span>
              ) : null}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 16,
              padding: "14px 18px",
              borderRadius: 20,
              background: "var(--s1)",
              border: "1px solid var(--ln)",
            }}
          >
            {rings.map((r) => (
              <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  role="img"
                  aria-label={r.aria}
                  style={{ width: 52, height: 52, borderRadius: "50%", background: r.bg, display: "grid", placeItems: "center", transition: "background .4s" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--s1)", display: "grid", placeItems: "center", color: r.c }}>
                    <Icon n={r.icon} s={16} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 16 }}>{r.v}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: r.c }}>{r.k}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------- filter bar ----------------------------- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, borderRadius: 20, background: "var(--bg2)", border: "1px solid var(--ln)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <label
              style={{
                flex: "1 1 260px",
                maxWidth: 440,
                height: 46,
                borderRadius: 12,
                background: "var(--bg)",
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
                ref={searchRef}
                aria-label="Search challenges"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search quests, topics, tracks…"
                style={{ flex: 1, minWidth: 0, height: "100%", border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 15px var(--fu)" }}
              />
              {q ? (
                <button
                  aria-label="Clear search"
                  onClick={() => setQ("")}
                  style={{ width: 30, height: 30, border: 0, borderRadius: 8, background: "var(--s2)", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <Icon n="x" s={14} />
                </button>
              ) : null}
            </label>

            <div
              role="tablist"
              aria-label="Track"
              style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--ln)" }}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const i = trackTabs.findIndex((t) => t.id === track);
                const next = (i + (e.key === "ArrowRight" ? 1 : trackTabs.length - 1)) % trackTabs.length;
                setTrack(trackTabs[next].id);
              }}
            >
              {trackTabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={t.sel}
                  onClick={() => {
                    setTrack(t.id);
                    setPage(1);
                  }}
                  style={{
                    whiteSpace: "nowrap",
                    height: 38,
                    padding: "0 13px",
                    border: 0,
                    borderRadius: 10,
                    background: t.bg,
                    color: t.fg,
                    font: "600 14px var(--fu)",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    transition: "background .12s",
                  }}
                >
                  <Icon n={t.icon} s={15} />
                  {t.label}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: t.cbg }}>{t.n}</span>
                </button>
              ))}
            </div>

            {desk ? (
              <div role="group" aria-label="View" style={{ marginLeft: "auto", display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--ln)" }}>
                <button
                  aria-label="Grid view"
                  aria-pressed={!listView}
                  onClick={() => setLayout("grid")}
                  style={{ width: 38, height: 36, border: 0, borderRadius: 9, background: !listView ? "var(--s2)" : "transparent", color: "var(--fg)", display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <Icon n="layout-grid" s={17} />
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={listView}
                  onClick={() => setLayout("list")}
                  style={{ width: 38, height: 36, border: 0, borderRadius: 9, background: listView ? "var(--s2)" : "transparent", color: "var(--fg)", display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <Icon n="list" s={17} />
                </button>
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {DIFFS.map(([id, label, n]) => {
              const on = diff === id;
              return (
                <button
                  key={id}
                  aria-pressed={on}
                  onClick={() => {
                    setDiff(id);
                    setPage(1);
                  }}
                  style={{
                    whiteSpace: "nowrap",
                    height: 34,
                    padding: "0 13px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--fg)" : "var(--ln2)"}`,
                    background: on ? "var(--fg)" : "transparent",
                    color: on ? "var(--bg)" : "var(--fg2)",
                    font: "600 13.5px var(--fu)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex" }}>
                    {Array.from({ length: n }, (_, i) => (
                      <Icon key={i} n="flame" s={13} f />
                    ))}
                  </span>
                  {label}
                </button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--fg3)" }}>
              {filtered.length} quests · {onTable.toLocaleString()} pts on the table
            </span>
          </div>
        </div>

        {/* ------------------------------ results ------------------------------ */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(auto-fill,minmax(300px,1fr))" : "minmax(0,1fr)", gap: 20 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="ym-skel" style={{ height: 290, borderRadius: 18 }} />
            ))}
          </div>
        ) : isError ? (
          <div
            style={{
              padding: "48px 24px",
              borderRadius: 22,
              border: "1px dashed var(--ln2)",
              background: "var(--s1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 10,
            }}
          >
            <span style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--Rs)", color: "var(--Rt)" }}>
              <Icon n="wifi-off" s={24} />
            </span>
            <b style={{ fontSize: 18 }}>We couldn’t load the challenges</b>
            <span style={{ fontSize: 14.5, color: "var(--fg2)", maxWidth: 320 }}>
              The arena didn’t answer. Try again, or ask on Discord if it keeps happening.
            </span>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => void refetch()}
                className="ym-press"
                style={{ height: 42, padding: "0 16px", border: 0, borderRadius: 12, background: "var(--btn)", boxShadow: "0 4px 0 var(--btnd)", color: "#fff", font: "700 14px var(--fu)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", ["--base" as string]: "var(--btnd)" }}
              >
                <Icon n="rotate-ccw" s={15} />
                Try again
              </button>
              <a
                href="https://discord.gg/gdgbatna"
                target="_blank"
                rel="noopener"
                style={{ height: 42, padding: "0 16px", borderRadius: 12, border: "1px solid var(--ln2)", color: "var(--fg)", font: "700 14px var(--fu)", display: "flex", alignItems: "center", gap: 7 }}
              >
                <Icon n="message-circle" s={15} />
                Ask on Discord
              </a>
            </div>
            <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg3)", marginTop: 4 }}>GET /challenges · failed</span>
          </div>
        ) : filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: listView ? "minmax(0,1fr)" : desk ? "repeat(auto-fill,minmax(300px,1fr))" : "minmax(0,1fr)",
              gap: listView ? 10 : 20,
              opacity: isFetching && !isLoading ? 0.6 : 1,
              transition: "opacity .2s",
            }}
          >
            {filtered.map((c) => (
              <QuestCard key={c.id} c={c} view={listView ? "list" : "grid"} onOpen={() => setSel(c.id)} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "48px 24px",
              borderRadius: 22,
              border: "1px dashed var(--ln2)",
              background: "var(--s1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 10,
            }}
          >
            <Icon n="search-x" s={28} style={{ color: "var(--fg3)" }} />
            <b style={{ fontSize: 18 }}>No quests here yet</b>
            <span style={{ fontSize: 14.5, color: "var(--fg2)" }}>Nothing matches these filters. Try another track or clear them.</span>
            <button
              onClick={clearAll}
              style={{
                marginTop: 6,
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid var(--ln2)",
                background: "transparent",
                color: "var(--fg)",
                font: "700 14px var(--fu)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
              }}
            >
              <Icon n="rotate-ccw" s={15} />
              Clear filters
            </button>
          </div>
        )}

        {pageCount > 1 ? (
          <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <button
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--ln2)",
                background: "transparent",
                color: page <= 1 ? "var(--fg3)" : "var(--fg)",
                display: "grid",
                placeItems: "center",
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              <Icon n="chevron-left" s={17} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
              const on = n === page;
              return (
                <button
                  key={n}
                  aria-current={on ? "page" : undefined}
                  onClick={() => setPage(n)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: `1px solid ${on ? "var(--fg)" : "var(--ln2)"}`,
                    background: on ? "var(--fg)" : "transparent",
                    color: on ? "var(--bg)" : "var(--fg)",
                    font: "700 14px var(--fu)",
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              );
            })}
            <button
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--ln2)",
                background: "transparent",
                color: page >= pageCount ? "var(--fg3)" : "var(--fg)",
                display: "grid",
                placeItems: "center",
                cursor: page >= pageCount ? "not-allowed" : "pointer",
              }}
            >
              <Icon n="chevron-right" s={17} />
            </button>
          </nav>
        ) : null}
      </main>

      {current ? <SubmissionModal c={current} onClose={() => setSel(null)} onSubmitted={onSubmitted} /> : null}
      {cel ? <ConqueredOverlay cel={cel} onClose={() => setCel(null)} /> : null}
    </>
  );
}
