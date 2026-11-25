"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/toast";
import { updateSubmission, type AdminSubmission } from "@/lib/api";
import { shouldFallback } from "@/lib/sample";
import { useAdminSubmissions } from "@/lib/useData";
import { DIFF, TRACK, hue, initials, rel, tierFor } from "@/lib/game";
import { isSafeUrl } from "@/lib/url";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];
const GRID = "minmax(0,1fr) minmax(0,1.4fr) minmax(0,1.5fr) 120px 118px 84px 84px";

const ST: Record<string, [string, string, string]> = {
  pending: ["Pending", "clock", "Y"],
  accepted: ["Accepted", "circle-check", "G"],
  rejected: ["Rejected", "circle-x", "R"],
};

const TABS: [string, string, string | null][] = [
  ["pending", "Pending", "Y"],
  ["accepted", "Accepted", "G"],
  ["rejected", "Rejected", "R"],
  ["all", "All", null],
];

function Stripe({ h = 3 }: { h?: number }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", height: h }}>
      {COLS.map((c) => (
        <span key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

function answerOf(s: AdminSubmission) {
  if (s.flag) return { text: s.flag, icon: "flag", color: "var(--Rt)", isFlag: true };
  if (s.link) {
    const colab = s.link.includes("colab.research.google.com");
    return { text: s.link, icon: colab ? "notebook-pen" : "github", color: "var(--Bt)", isFlag: false };
  }
  return { text: "—", icon: "minus", color: "var(--fg3)", isFlag: false };
}

export default function SubmissionsView() {
  const { data, isLoading, refetch } = useAdminSubmissions();
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [track, setTrack] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<AdminSubmission | null>(null);
  const [mobile, setMobile] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sweep, setSweep] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setMobile(window.innerWidth < 768);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  /* ?view=<id> opens the drawer */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("view");
    if (id) setOpenId(id);
  }, []);
  useEffect(() => {
    const u = new URL(window.location.href);
    if (openId) u.searchParams.set("view", openId);
    else u.searchParams.delete("view");
    window.history.replaceState(null, "", u.pathname + (u.search || ""));
  }, [openId]);

  const all = data ?? [];
  const term = q.trim().toLowerCase();

  const counts = useMemo(
    () => ({
      pending: all.filter((s) => s.status === "pending").length,
      accepted: all.filter((s) => s.status === "accepted").length,
      rejected: all.filter((s) => s.status === "rejected").length,
      all: all.length,
    }),
    [all],
  );

  const rows = useMemo(() => {
    const list = all.filter(
      (s) =>
        (tab === "all" || s.status === tab) &&
        (track === "all" || s.challenge?.type === track) &&
        (!term || `${s.user?.nick_name ?? ""} ${s.challenge?.title ?? ""}`.toLowerCase().includes(term)),
    );
    // pending rows sort first, then newest
    return [...list].sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
      }
      return Date.parse(b.created_at || "") - Date.parse(a.created_at || "");
    });
  }, [all, tab, track, term]);

  const open = openId ? all.find((s) => s.id === openId) ?? null : null;
  const openIdx = open ? rows.findIndex((s) => s.id === open.id) : -1;

  async function save(s: AdminSubmission, status: string, points: number, link?: string | null) {
    setBusyId(s.id);
    const prev = all;
    // optimistic flip
    qc.setQueryData<AdminSubmission[]>(["submissions"], (old) =>
      (old ?? []).map((x) => (x.id === s.id ? { ...x, status: status as AdminSubmission["status"], points, link: link ?? x.link } : x)),
    );
    try {
      try {
        await updateSubmission({ SubmissionID: s.id, status, points, ...(link !== undefined ? { link } : {}) });
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      setSweep(s.id);
      setTimeout(() => setSweep(null), 1200);
      void qc.invalidateQueries({ queryKey: ["leader-board"] });
      void refetch();
      showToast({
        icon: status === "accepted" ? "circle-check" : status === "rejected" ? "circle-x" : "clock",
        bg: status === "accepted" ? "var(--Gs)" : status === "rejected" ? "var(--Rs)" : "var(--Ys)",
        fg: status === "accepted" ? "var(--Gt)" : status === "rejected" ? "var(--Rt)" : "var(--Yt)",
        title: `Submission ${status}`,
        msg: `@${s.user?.nick_name ?? "player"} · ${s.challenge?.title ?? ""}`,
      });
      setOpenId(null);
      setEdit(null);
    } catch {
      qc.setQueryData(["submissions"], prev);
      showToast({ icon: "circle-alert", bg: "var(--Rs)", fg: "var(--Rt)", title: "Couldn’t save the review", msg: "The change was rolled back.", error: true });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div style={{ padding: mobile ? "14px 12px" : "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, borderBottom: "1px solid var(--ln)", flexWrap: "wrap" }}>
          {TABS.map(([id, label, k]) => {
            const on = tab === id;
            const n = counts[id as keyof typeof counts];
            return (
              <button
                key={id}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(id)}
                style={{
                  position: "relative",
                  height: 44,
                  padding: "0 2px",
                  marginInlineEnd: 10,
                  border: 0,
                  background: "transparent",
                  color: on ? "var(--fg)" : "var(--fg2)",
                  font: "600 14.5px var(--fu)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: "pointer",
                }}
              >
                {label}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: k ? `var(--${k}s)` : "var(--s2)",
                    color: k ? `var(--${k}t)` : "var(--fg2)",
                  }}
                >
                  {n}
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -1,
                    height: 3,
                    borderRadius: 2,
                    background: on ? (k ? `var(--${k})` : "var(--fg)") : "transparent",
                  }}
                />
              </button>
            );
          })}
          <div style={{ marginInlineStart: "auto", display: "flex", gap: 8, paddingBottom: 8, flexWrap: "wrap" }}>
            <label style={{ width: mobile ? "100%" : 280, height: 38, borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--ln2)", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", color: "var(--fg3)", fontSize: 13.5 }}>
              <Icon n="search" s={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search user or challenge"
                aria-label="Search submissions"
                style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 13.5px var(--fu)" }}
              />
            </label>
            <div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 10, background: "var(--bg2)", border: "1px solid var(--ln)" }}>
              {(["all", "ps", "ctf", "ai"] as const).map((t) => {
                const on = track === t;
                const color = t === "ps" ? "var(--Bt)" : t === "ctf" ? "var(--Rt)" : t === "ai" ? "var(--Gt)" : "var(--fg)";
                return (
                  <button
                    key={t}
                    onClick={() => setTrack(t)}
                    aria-pressed={on}
                    style={{
                      height: 30,
                      padding: "0 10px",
                      border: 0,
                      borderRadius: 7,
                      background: on ? "var(--s2)" : "transparent",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color,
                      cursor: "pointer",
                    }}
                  >
                    {t === "all" ? "All" : t.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {mobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((s) => {
              const a = answerOf(s);
              const st = ST[s.status];
              const h = hue(s.user?.nick_name ?? "");
              return (
                <div key={s.id} style={{ borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
                      {initials(s.user?.nick_name ?? "?")}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: 14 }}>@{s.user?.nick_name}</b>
                      <span style={{ fontSize: 12, color: "var(--fg3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.challenge?.title}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, height: 26, padding: "0 9px", borderRadius: 8, background: `var(--${st[2]}s)`, color: `var(--${st[2]}t)`, fontSize: 12, fontWeight: 700 }}>
                      <Icon n={st[1]} s={13} w={2.5} />
                      {st[0]}
                    </span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 10px", borderRadius: 9, background: "var(--bg)", fontFamily: "var(--fm)", fontSize: 12, color: a.color }}>
                    <Icon n={a.icon} s={14} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</span>
                  </span>
                  <button
                    onClick={() => setOpenId(s.id)}
                    style={{ height: 40, borderRadius: 11, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "600 13.5px var(--fu)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer" }}
                  >
                    <Icon n="eye" s={15} />
                    Review
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div role="table" aria-label="Submissions" style={{ borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <div
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  gap: 12,
                  alignItems: "center",
                  height: 40,
                  padding: "0 16px",
                  background: "var(--bg2)",
                  borderBottom: "1px solid var(--ln)",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".07em",
                  color: "var(--fg3)",
                  minWidth: 1040,
                }}
              >
                <span>USER</span>
                <span>CHALLENGE</span>
                <span>ANSWER</span>
                <span>POINTS</span>
                <span>STATUS</span>
                <span>SUBMITTED</span>
                <span style={{ textAlign: "end" }}>ACTIONS</span>
              </div>

              {isLoading
                ? Array.from({ length: 8 }, (_, i) => <div key={i} className="ym-skel" style={{ height: 58, borderBottom: "1px solid var(--ln)" }} />)
                : rows.map((s) => {
                    const a = answerOf(s);
                    const st = ST[s.status];
                    const h = hue(s.user?.nick_name ?? "");
                    const tr = s.challenge ? TRACK[s.challenge.type] : TRACK.ps;
                    const max = s.challenge?.points ?? 0;
                    const pts = s.points ?? 0;
                    const selected = openId === s.id;
                    return (
                      <div
                        key={s.id}
                        role="row"
                        className="ym-admrow"
                        style={{
                          display: "grid",
                          gridTemplateColumns: GRID,
                          gap: 12,
                          alignItems: "center",
                          height: 58,
                          padding: "0 16px",
                          borderBottom: "1px solid var(--ln)",
                          fontSize: 13.5,
                          minWidth: 1040,
                          background: sweep === s.id ? "linear-gradient(90deg, transparent, var(--Gs) 50%, transparent)" : selected ? "var(--s2)" : "transparent",
                          backgroundSize: sweep === s.id ? "340px 100%" : undefined,
                          animation: sweep === s.id ? "ymSweep 1.2s linear" : undefined,
                          boxShadow: selected ? "inset 3px 0 0 var(--B)" : "none",
                          opacity: busyId === s.id ? 0.6 : 1,
                          transition: "background .12s, opacity .12s",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                          <span style={{ flex: "none", width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
                            {initials(s.user?.nick_name ?? "?")}
                          </span>
                          <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{s.user?.nick_name}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                          <span style={{ flex: "none", width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: `var(--${tr.k}s)`, color: `var(--${tr.k}t)` }}>
                            <Icon n={tr.icon} s={15} />
                          </span>
                          <span style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.25 }}>
                            <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.challenge?.title}</span>
                            <span style={{ fontFamily: "var(--fm)", fontSize: 11.5, color: "var(--fg3)" }}>{s.challenge?.subtitle}</span>
                          </span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7, height: 32, padding: "0 10px", borderRadius: 9, background: "var(--bg)", fontFamily: "var(--fm)", fontSize: 12, color: a.color }}>
                            <Icon n={a.icon} s={14} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</span>
                          </span>
                          <button
                            aria-label="Copy answer"
                            onClick={() => {
                              try {
                                void navigator.clipboard?.writeText(a.text);
                              } catch {
                                /* denied */
                              }
                            }}
                            style={{ flex: "none", width: 30, height: 30, borderRadius: 8, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                          >
                            <Icon n="copy" s={13} />
                          </button>
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <span style={{ fontFamily: "var(--fm)", fontSize: 12.5 }}>
                            <b style={{ color: "var(--fg)" }}>{pts}</b>
                            <span style={{ color: "var(--fg3)" }}> / {max}</span>
                          </span>
                          <span style={{ height: 4, borderRadius: 2, background: "var(--ln)", overflow: "hidden" }}>
                            <span style={{ display: "block", height: "100%", background: "var(--Gt)", width: `${max ? Math.round((pts / max) * 100) : 0}%` }} />
                          </span>
                        </span>
                        <span style={{ justifySelf: "start", display: "flex", alignItems: "center", gap: 5, height: 26, padding: "0 9px", borderRadius: 8, background: `var(--${st[2]}s)`, color: `var(--${st[2]}t)`, fontSize: 12, fontWeight: 700 }}>
                          <Icon n={st[1]} s={13} w={2.5} />
                          {st[0]}
                        </span>
                        <span style={{ fontSize: 12.5, color: "var(--fg2)" }}>{s.created_at ? rel(s.created_at) : "—"}</span>
                        <span style={{ display: "flex", justifyContent: "flex-end", gap: 2, color: "var(--fg2)" }}>
                          <button aria-label="View submission" onClick={() => setOpenId(s.id)} className="ym-admbtn" style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: selected ? "var(--s2)" : "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" }}>
                            <Icon n="eye" s={15} />
                          </button>
                          <button aria-label="Edit submission" onClick={() => setEdit(s)} className="ym-admbtn" style={{ width: 32, height: 32, border: 0, borderRadius: 8, background: "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" }}>
                            <Icon n="pencil" s={15} />
                          </button>
                        </span>
                      </div>
                    );
                  })}

              {!isLoading && rows.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--fg2)", fontSize: 14 }}>Nothing to review here.</div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {open ? (
        <ReviewDrawer
          s={open}
          busy={busyId === open.id}
          onClose={() => setOpenId(null)}
          onPrev={openIdx > 0 ? () => setOpenId(rows[openIdx - 1].id) : undefined}
          onNext={openIdx >= 0 && openIdx < rows.length - 1 ? () => setOpenId(rows[openIdx + 1].id) : undefined}
          onSave={save}
          onEditLink={() => setEdit(open)}
        />
      ) : null}
      {edit ? <EditSubmissionModal s={edit} busy={busyId === edit.id} onClose={() => setEdit(null)} onSave={save} /> : null}
    </>
  );
}

/* ------------------------------ review drawer ------------------------------ */

function ReviewDrawer({
  s,
  busy,
  onClose,
  onPrev,
  onNext,
  onSave,
  onEditLink,
}: {
  s: AdminSubmission;
  busy: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSave: (s: AdminSubmission, status: string, points: number, link?: string | null) => void;
  onEditLink: () => void;
}) {
  const max = s.challenge?.points ?? 0;
  const [status, setStatus] = useState(s.status as string);
  const [pts, setPts] = useState(s.points ?? 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStatus(s.status);
    setPts(s.points ?? 0);
  }, [s.id, s.status, s.points]);

  // Accepted prefills max points; Rejected sets 0.
  const pick = (next: string) => {
    setStatus(next);
    if (next === "accepted") setPts(max);
    if (next === "rejected") setPts(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const a = answerOf(s);
  const h = hue(s.user?.nick_name ?? "");
  const tr = s.challenge ? TRACK[s.challenge.type] : TRACK.ps;
  const n = s.challenge ? DIFF[s.challenge.difficulty]?.n ?? 1 : 1;
  const st = ST[s.status];
  const tier = tierFor(0);

  return (
    <div onClick={() => !busy && onClose()} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(5,4,10,.5)" }}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="dr-t"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          insetInlineEnd: 0,
          bottom: 0,
          width: "min(520px, 100%)",
          background: "var(--s1)",
          borderInlineStart: "1px solid var(--ln2)",
          boxShadow: "var(--sh)",
          display: "flex",
          flexDirection: "column",
          animation: "ymDrawerIn .32s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <Stripe />
        <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--ln)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, height: 26, padding: "0 9px", borderRadius: 8, background: `var(--${st[2]}s)`, color: `var(--${st[2]}t)`, fontSize: 12, fontWeight: 700 }}>
            <Icon n={st[1]} s={13} w={2.5} />
            {st[0]}
          </span>
          <h2 id="dr-t" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            Submission
          </h2>
          <span style={{ fontSize: 13, color: "var(--fg3)" }}>· {s.created_at ? rel(s.created_at) : "—"}</span>
          <span style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
            <button aria-label="Previous submission" disabled={!onPrev} onClick={onPrev} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--ln)", background: "transparent", color: onPrev ? "var(--fg2)" : "var(--ln2)", display: "grid", placeItems: "center", cursor: onPrev ? "pointer" : "not-allowed" }}>
              <Icon n="chevron-left" s={16} />
            </button>
            <button aria-label="Next submission" disabled={!onNext} onClick={onNext} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--ln)", background: "transparent", color: onNext ? "var(--fg2)" : "var(--ln2)", display: "grid", placeItems: "center", cursor: onNext ? "pointer" : "not-allowed" }}>
              <Icon n="chevron-right" s={16} />
            </button>
            <button aria-label="Close" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <Icon n="x" s={16} />
            </button>
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", fontWeight: 700, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
              {initials(s.user?.nick_name ?? "?")}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <b>@{s.user?.nick_name}</b>
              <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>{s.user?.email ?? tier.name}</span>
            </span>
          </div>

          <div style={{ padding: 14, borderRadius: 14, background: "var(--bg)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, height: 26, padding: "0 9px 0 7px", borderRadius: 8, background: `var(--${tr.k}s)`, color: `var(--${tr.k}t)`, fontSize: 11.5, fontWeight: 800 }}>
                <Icon n={tr.icon} s={13} />
                {tr.short}
              </span>
              <span style={{ display: "flex", color: `var(--${tr.k}t)` }}>
                {[0, 1, 2].map((i) => (
                  <Icon key={i} n="flame" s={13} f={i < n} style={{ color: i < n ? `var(--${tr.k}t)` : "var(--ln2)" }} />
                ))}
              </span>
              <span style={{ marginInlineStart: "auto", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 14, color: "var(--Yt)" }}>{max} pts max</span>
            </div>
            <b style={{ fontSize: 16 }}>{s.challenge?.title}</b>
            <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--fg3)" }}>{s.challenge?.subtitle}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>
              {a.isFlag ? "SUBMITTED FLAG" : "SUBMITTED LINK"}
            </span>
            <div style={{ padding: 16, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--ln2)", fontFamily: "var(--fm)", fontSize: 16, wordBreak: "break-all", lineHeight: 1.5 }}>
              {a.text}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  try {
                    void navigator.clipboard?.writeText(a.text);
                  } catch {
                    /* denied */
                  }
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "600 13px var(--fu)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <Icon n={copied ? "check" : "copy"} s={14} />
                {copied ? "Copied!" : a.isFlag ? "Copy flag" : "Copy link"}
              </button>
              {!a.isFlag && s.link ? (
                isSafeUrl(s.link) ? (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "600 13px var(--fu)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon n="external-link" s={14} />
                    Test link
                  </a>
                ) : (
                  <span title="Invalid or unsafe link protocol" style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid rgba(234,67,53,0.3)", background: "var(--Rs)", color: "var(--Rt)", font: "600 12px var(--fu)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon n="circle-alert" s={14} />
                    Unsafe link
                  </span>
                )
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--ln)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>SUBMITTED</div>
              <div style={{ marginTop: 4 }}>
                {s.created_at ? new Date(s.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--ln)", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>SUBMISSION ID</div>
                <div style={{ marginTop: 4, fontFamily: "var(--fm)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.id}</div>
              </div>
              <button
                aria-label="Copy submission ID"
                onClick={() => {
                  try {
                    void navigator.clipboard?.writeText(s.id);
                  } catch {
                    /* denied */
                  }
                }}
                style={{ border: 0, background: "transparent", color: "var(--fg3)", cursor: "pointer", display: "grid", placeItems: "center" }}
              >
                <Icon n="copy" s={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>REVIEW</span>
            <div role="radiogroup" aria-label="Status" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 6 }}>
              {(["pending", "accepted", "rejected"] as const).map((v) => {
                const on = status === v;
                const k = ST[v][2];
                return (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(v)}
                    style={{
                      height: 42,
                      borderRadius: 11,
                      border: on ? `2px solid var(--${k})` : "1px solid var(--ln2)",
                      background: on ? `var(--${k}s)` : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: on ? `var(--${k}t)` : "var(--fg2)",
                      cursor: "pointer",
                    }}
                  >
                    <Icon n={ST[v][1]} s={15} />
                    {ST[v][0]}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
              <span style={{ height: 44, borderRadius: 11, background: "var(--bg)", border: "1px solid var(--ln2)", display: "flex", alignItems: "center", padding: "0 12px", gap: 8, fontFamily: "var(--fd)", fontWeight: 700 }}>
                <Icon n="zap" s={15} f style={{ color: "var(--Yt)" }} />
                <input
                  type="number"
                  min={0}
                  max={max}
                  value={pts}
                  onChange={(e) => setPts(Math.max(0, Math.min(max, Math.floor(Number(e.target.value) || 0))))}
                  aria-label="Points awarded"
                  style={{ width: 70, border: 0, outline: 0, background: "transparent", color: "var(--fg)", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15 }}
                />
                <span style={{ fontFamily: "var(--fu)", fontWeight: 500, fontSize: 12.5, color: "var(--fg3)" }}>/ {max}</span>
              </span>
              <button onClick={() => setPts(max)} style={{ height: 44, padding: "0 12px", borderRadius: 11, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "600 13px var(--fu)", cursor: "pointer" }}>
                Full points
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--ln)", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onEditLink} style={{ height: 42, padding: "0 14px", borderRadius: 11, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 14px var(--fu)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <Icon n="pencil" s={15} />
            Edit link…
          </button>
          <button
            onClick={() => onSave(s, status, pts)}
            disabled={busy}
            aria-busy={busy}
            style={{
              marginInlineStart: "auto",
              height: 42,
              padding: "0 18px",
              border: 0,
              borderRadius: 11,
              background: status === "rejected" ? "#D93025" : status === "pending" ? "var(--btn)" : "#188038",
              boxShadow: `0 2px 0 ${status === "rejected" ? "#A50E0E" : status === "pending" ? "var(--btnd)" : "#0D652D"}`,
              color: "#fff",
              font: "700 14px var(--fu)",
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", animation: busy ? "ymSpin .8s linear infinite" : "none" }}>
              <Icon n={busy ? "loader-circle" : "check"} s={16} w={2.5} />
            </span>
            {status === "accepted" ? `Save · accept +${pts}` : status === "rejected" ? "Save · reject" : "Save · keep pending"}
          </button>
        </div>
      </aside>
    </div>
  );
}

/* --------------------------- edit submission modal --------------------------- */

function EditSubmissionModal({
  s,
  busy,
  onClose,
  onSave,
}: {
  s: AdminSubmission;
  busy: boolean;
  onClose: () => void;
  onSave: (s: AdminSubmission, status: string, points: number, link?: string | null) => void;
}) {
  const max = s.challenge?.points ?? 0;
  const [status, setStatus] = useState(s.status as string);
  const [pts, setPts] = useState(s.points ?? 0);
  const [link, setLink] = useState(s.link ?? "");
  const tr = s.challenge ? TRACK[s.challenge.type] : TRACK.ps;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div onClick={() => !busy && onClose()} style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(5,4,10,.72)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 16 }}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(500px, calc(100vw - 32px))", borderRadius: 22, background: "var(--s1)", border: "1px solid var(--ln2)", boxShadow: "var(--sh)", overflow: "hidden", animation: "ymIn .2s cubic-bezier(.2,.8,.2,1)" }}
      >
        <Stripe />
        <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--ln)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: `var(--${tr.k}s)`, color: `var(--${tr.k}t)` }}>
            <Icon n={tr.icon} s={19} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: 1, lineHeight: 1.3 }}>
            <b style={{ fontSize: 15.5 }}>{s.challenge?.title}</b>
            <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>
              @{s.user?.nick_name} · {s.created_at ? rel(s.created_at) : "—"}
            </span>
          </span>
          <button aria-label="Close" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon n="x" s={16} />
          </button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Status</span>
            <div role="radiogroup" aria-label="Status" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 6 }}>
              {(["pending", "accepted", "rejected"] as const).map((v) => {
                const on = status === v;
                const k = ST[v][2];
                return (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      setStatus(v);
                      if (v === "accepted") setPts(max);
                      if (v === "rejected") setPts(0);
                    }}
                    style={{
                      height: 42,
                      borderRadius: 11,
                      border: on ? `2px solid var(--${k})` : "1px solid var(--ln2)",
                      background: on ? `var(--${k}s)` : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: on ? `var(--${k}t)` : "var(--fg2)",
                      cursor: "pointer",
                    }}
                  >
                    <Icon n={ST[v][1]} s={15} />
                    {ST[v][0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 600 }}>
              Points awarded
              <span style={{ fontFamily: "var(--fm)", fontWeight: 400, color: "var(--fg3)" }}>0 – {max}</span>
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center" }}>
              <button aria-label="Minus 10" onClick={() => setPts((n) => Math.max(0, n - 10))} style={{ width: 44, height: 44, borderRadius: 11, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "700 13px var(--fu)", cursor: "pointer" }}>
                −10
              </button>
              <input
                type="number"
                min={0}
                max={max}
                value={pts}
                onChange={(e) => setPts(Math.max(0, Math.min(max, Math.floor(Number(e.target.value) || 0))))}
                aria-label="Points awarded"
                style={{ height: 44, borderRadius: 11, background: "var(--bg)", border: "1px solid var(--ln2)", textAlign: "center", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 18, color: "var(--fg)", outline: 0 }}
              />
              <button aria-label="Plus 10" onClick={() => setPts((n) => Math.min(max, n + 10))} style={{ width: 44, height: 44, borderRadius: 11, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "700 13px var(--fu)", cursor: "pointer" }}>
                +10
              </button>
            </div>
            <span style={{ height: 6, borderRadius: 3, background: "var(--ln)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", borderRadius: 3, background: "var(--Gt)", width: `${max ? Math.round((pts / max) * 100) : 0}%` }} />
            </span>
          </div>

          {s.flag ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Link</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  aria-label="Submission link"
                  style={{ flex: 1, minWidth: 0, height: 44, borderRadius: 11, background: "var(--bg)", border: "1px solid var(--ln2)", padding: "0 12px", color: "var(--fg)", font: "500 13.5px var(--fm)", outline: 0 }}
                />
                {isSafeUrl(link) ? (
                  <a
                    href={link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ height: 44, padding: "0 12px", borderRadius: 11, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "600 13px var(--fu)", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                  >
                    <Icon n="external-link" s={14} />
                    Test link
                  </a>
                ) : (
                  <span
                    title={link ? "Invalid or unsafe URL protocol (must start with http:// or https://)" : "No URL entered"}
                    style={{ height: 44, padding: "0 12px", borderRadius: 11, border: "1px solid rgba(234,67,53,0.3)", background: "var(--Rs)", color: "var(--Rt)", font: "600 12px var(--fu)", display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}
                  >
                    <Icon n="circle-alert" s={14} />
                    {link ? "Unsafe link" : "No link"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--ln)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 14px var(--fu)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(s, status, pts, s.flag ? undefined : link)}
            disabled={busy}
            aria-busy={busy}
            style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 10, background: "var(--btn)", boxShadow: "0 2px 0 var(--btnd)", color: "#fff", font: "700 14px var(--fu)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
          >
            <span style={{ display: "flex", animation: busy ? "ymSpin .8s linear infinite" : "none" }}>
              <Icon n={busy ? "loader-circle" : "check"} s={15} w={2.5} />
            </span>
            Save review
          </button>
        </div>
      </div>
    </div>
  );
}
