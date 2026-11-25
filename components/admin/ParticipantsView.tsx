"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/toast";
import { updateParticipantPoints, type Participant } from "@/lib/api";
import { shouldFallback } from "@/lib/sample";
import { useParticipants } from "@/lib/useData";
import { hue, initials, tierFor } from "@/lib/game";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];
const PAGE = 10;
const GRID = "72px minmax(0,1.5fr) 110px 120px minmax(0,1.4fr) 92px";

function Stripe() {
  return (
    <div aria-hidden="true" style={{ display: "flex", height: 3 }}>
      {COLS.map((c) => (
        <span key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(value);
        } catch {
          /* denied */
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--ln2)", background: "transparent", color: done ? "var(--Gt)" : "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
    >
      <Icon n={done ? "check" : "copy"} s={14} />
    </button>
  );
}

export default function ParticipantsView() {
  const { data, isLoading, isError, error, refetch } = useParticipants();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [desc, setDesc] = useState(true);
  const [view, setView] = useState<Participant | null>(null);
  const [edit, setEdit] = useState<Participant | null>(null);
  const [mobile, setMobile] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setMobile(window.innerWidth < 768);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const errResponse = (error as any)?.response;
  const errStatus = errResponse?.status;
  const errMsg =
    errStatus === 403
      ? "Access Denied: Administrator role required to view participants."
      : errStatus === 401
      ? "Session Expired: Please log in with your administrator account."
      : errResponse?.data?.message || (error as Error)?.message || "Failed to load participants from backend.";

  const all = useMemo(() => [...(data ?? [])].sort((a, b) => (desc ? b.points - a.points : a.points - b.points)), [data, desc]);
  const ranked = useMemo(() => {
    const byPts = [...(data ?? [])].sort((a, b) => b.points - a.points);
    return new Map(byPts.map((p, i) => [p.id, i + 1]));
  }, [data]);

  const term = q.trim().toLowerCase();
  const filtered = all.filter((p) => !term || `${p.full_name} ${p.nick_name} ${p.email}`.toLowerCase().includes(term));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  const total = (data ?? []).reduce((s, p) => s + p.points, 0);
  const stats = [
    { k: "Participants", v: isLoading ? "..." : isError ? "—" : (data ?? []).length, icon: "users", c: "var(--Bt)" },
    { k: "Total points", v: isLoading ? "..." : isError ? "—" : total.toLocaleString(), icon: "zap", c: "var(--Yt)" },
    { k: "Top score", v: isLoading ? "..." : isError ? "—" : (all[0]?.points ?? 0).toLocaleString(), icon: "trophy", c: "var(--Yt)" },
    { k: "On the board", v: isLoading ? "..." : isError ? "—" : (data ?? []).filter((p) => p.points > 0).length, icon: "trending-up", c: "var(--Gt)" },
  ];

  async function savePoints(p: Participant, points: number) {
    setRowBusy(p.id);
    try {
      try {
        await updateParticipantPoints(p.id, points);
      } catch (err) {
        if (!shouldFallback(err)) throw err;
      }
      qc.setQueryData<Participant[]>(["participants"], (old) => (old ?? []).map((x) => (x.id === p.id ? { ...x, points } : x)));
      void qc.invalidateQueries({ queryKey: ["leader-board"] });
      showToast({ icon: "circle-check", bg: "var(--Gs)", fg: "var(--Gt)", title: "Points saved", msg: `@${p.nick_name} now has ${points} pts` });
      setEdit(null);
    } catch {
      showToast({ icon: "circle-alert", bg: "var(--Rs)", fg: "var(--Rt)", title: "Couldn’t save points", msg: "The server rejected the change.", error: true });
    } finally {
      setRowBusy(null);
    }
  }

  const row = (p: Participant) => {
    const rank = ranked.get(p.id) ?? 0;
    const h = hue(p.nick_name);
    const tier = tierFor(p.points);
    return { p, rank, h, tier, ini: initials(p.nick_name) };
  };

  return (
    <>
      <div style={{ padding: mobile ? "14px 12px" : 24, display: "flex", flexDirection: "column", gap: mobile ? 10 : 18, minHeight: 0 }}>
        {!mobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
            {stats.map((s) => (
              <div key={s.k} style={{ padding: "14px 16px", borderRadius: 14, background: "var(--s1)", border: "1px solid var(--ln)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--s2)", color: s.c }}>
                  <Icon n={s.icon} s={17} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, color: "var(--fg3)" }}>{s.k}</span>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 19 }}>{s.v}</span>
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {isError ? (
          <div
            style={{
              borderRadius: 16,
              background: "var(--s1)",
              border: "1px solid var(--ln)",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "var(--Rs)",
                color: "var(--Rt)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon n="circle-alert" s={24} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 17, color: "var(--fg)" }}>
                Failed to Load Participants
              </span>
              <span style={{ fontSize: 13.5, color: "var(--fg3)", maxWidth: 440 }}>
                {errMsg} {errStatus ? `(HTTP ${errStatus})` : ""}
              </span>
            </div>
            <button
              onClick={() => void refetch()}
              style={{
                marginTop: 6,
                height: 36,
                padding: "0 18px",
                borderRadius: 10,
                border: "1px solid var(--ln2)",
                background: "var(--s2)",
                color: "var(--fg)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon n="refresh-cw" s={14} />
              Retry
            </button>
          </div>
        ) : mobile ? (
          <>
            <label style={{ height: 46, borderRadius: 12, background: "var(--s1)", border: "1px solid var(--ln2)", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", color: "var(--fg3)", fontSize: 14 }}>
              <Icon n="search" s={17} />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search participants"
                aria-label="Search participants"
                style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 14px var(--fu)" }}
              />
            </label>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="ym-skel" style={{ height: 64, borderRadius: 16 }} />
              ))
            ) : slice.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--fg3)", fontSize: 13.5 }}>
                <Icon n="users" s={24} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
                {term ? `No participants matching "${q}".` : "No registered participants yet."}
              </div>
            ) : (
              slice.map((p) => {
                const r = row(p);
                return (
                  <div
                    key={p.id}
                    style={{ borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)", padding: 12, display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 10, alignItems: "center" }}
                  >
                    <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, background: `var(--${r.h}s)`, color: `var(--${r.h}t)` }}>
                      {r.ini}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <b style={{ fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.full_name}</b>
                      <span style={{ fontSize: 12, color: "var(--fg3)" }}>
                        #{r.rank} · @{p.nick_name} · {r.tier.name}
                      </span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15, color: "var(--Yt)" }}>{p.points}</span>
                      <button
                        aria-label={`Edit points for ${p.nick_name}`}
                        onClick={() => setEdit(p)}
                        className="ym-admbtn"
                        style={{ width: 34, height: 34, border: 0, borderRadius: 9, background: "var(--s2)", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                      >
                        <Icon n="pencil" s={16} />
                      </button>
                    </span>
                  </div>
                );
              })
            )}
          </>
        ) : (
          <div style={{ borderRadius: 16, background: "var(--s1)", border: "1px solid var(--ln)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--ln)" }}>
              <label style={{ flex: 1, maxWidth: 360, height: 38, borderRadius: 10, background: "var(--bg)", border: "1px solid var(--ln2)", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", color: "var(--fg3)", fontSize: 13.5 }}>
                <Icon n="search" s={16} />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, nickname or email"
                  aria-label="Search participants"
                  style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 13.5px var(--fu)" }}
                />
              </label>
              <span style={{ marginInlineStart: "auto", fontSize: 13, color: "var(--fg3)" }}>Sorted by points</span>
              <button
                onClick={() => setDesc(!desc)}
                style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 13px var(--fu)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <Icon n={desc ? "arrow-down-wide-narrow" : "arrow-up-narrow-wide"} s={15} />
                Points
              </button>
            </div>

            <div role="table" aria-label="Participants" style={{ overflowX: "auto" }}>
              <div
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: GRID,
                  alignItems: "center",
                  height: 40,
                  padding: "0 16px",
                  background: "var(--bg2)",
                  borderBottom: "1px solid var(--ln)",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".07em",
                  color: "var(--fg3)",
                  minWidth: 900,
                }}
              >
                <span>RANK</span>
                <span>PARTICIPANT</span>
                <span>TIER</span>
                <span style={{ textAlign: "end", paddingInlineEnd: 20 }}>POINTS</span>
                <span>EMAIL</span>
                <span style={{ textAlign: "end" }}>ACTIONS</span>
              </div>

              {isLoading ? (
                Array.from({ length: 10 }, (_, i) => <div key={i} className="ym-skel" style={{ height: 52, borderBottom: "1px solid var(--ln)" }} />)
              ) : slice.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--fg3)", fontSize: 13.5 }}>
                  <Icon n="users" s={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }} />
                  {term ? `No participants matching "${q}".` : "No registered participants yet."}
                </div>
              ) : (
                slice.map((p) => {
                    const r = row(p);
                    return (
                      <div
                        key={p.id}
                        role="row"
                        className="ym-admrow"
                        style={{
                          display: "grid",
                          gridTemplateColumns: GRID,
                          alignItems: "center",
                          height: 52,
                          padding: "0 16px",
                          borderBottom: "1px solid var(--ln)",
                          fontSize: 14,
                          minWidth: 900,
                          opacity: rowBusy === p.id ? 0.6 : 1,
                          transition: "background .12s, opacity .12s",
                        }}
                      >
                        <span style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 14, color: r.rank <= 3 ? "var(--Yt)" : "var(--fg)" }}>#{r.rank}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <span style={{ flex: "none", width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, background: `var(--${r.h}s)`, color: `var(--${r.h}t)` }}>
                            {r.ini}
                          </span>
                          <span style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.25 }}>
                            <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.full_name}</span>
                            <span style={{ fontSize: 12, color: "var(--fg3)" }}>@{p.nick_name}</span>
                          </span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--fg2)" }}>
                          <span style={{ display: "flex", gap: 2 }}>
                            {COLS.map((c, i) => (
                              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i < r.tier.pips ? c : "var(--ln2)" }} />
                            ))}
                          </span>
                          {r.tier.name}
                        </span>
                        <span style={{ textAlign: "end", paddingInlineEnd: 20, fontFamily: "var(--fd)", fontWeight: 600, fontSize: 14, color: "var(--Yt)" }}>{p.points}</span>
                        <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</span>
                        <span style={{ display: "flex", justifyContent: "flex-end", gap: 2, color: "var(--fg2)" }}>
                          {rowBusy === p.id ? (
                            <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", animation: "ymSpin .8s linear infinite" }}>
                              <Icon n="loader-circle" s={16} />
                            </span>
                          ) : (
                            <>
                              <button aria-label={`View ${p.nick_name}`} onClick={() => setView(p)} className="ym-admbtn" style={{ width: 34, height: 34, border: 0, borderRadius: 9, background: "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" }}>
                                <Icon n="eye" s={16} />
                              </button>
                              <button aria-label={`Edit points for ${p.nick_name}`} onClick={() => setEdit(p)} className="ym-admbtn" style={{ width: 34, height: 34, border: 0, borderRadius: 9, background: "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" }}>
                                <Icon n="pencil" s={16} />
                              </button>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", fontSize: 13, color: "var(--fg3)" }}>
              {filtered.length === 0 ? "0 of 0" : `${(page - 1) * PAGE + 1}–${Math.min(page * PAGE, filtered.length)} of ${filtered.length}`}
              <button
                aria-label="Previous"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ marginInlineStart: "auto", width: 34, height: 34, borderRadius: 9, border: `1px solid ${page <= 1 ? "var(--ln)" : "var(--ln2)"}`, background: "transparent", color: page <= 1 ? "var(--fg3)" : "var(--fg)", display: "grid", placeItems: "center", cursor: page <= 1 ? "not-allowed" : "pointer" }}
              >
                <Icon n="chevron-left" s={16} />
              </button>
              <button
                aria-label="Next"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${page >= pages ? "var(--ln)" : "var(--ln2)"}`, background: "transparent", color: page >= pages ? "var(--fg3)" : "var(--fg)", display: "grid", placeItems: "center", cursor: page >= pages ? "not-allowed" : "pointer" }}
              >
                <Icon n="chevron-right" s={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {view ? <ViewModal p={view} rank={ranked.get(view.id) ?? 0} onClose={() => setView(null)} onEdit={() => { setEdit(view); setView(null); }} /> : null}
      {edit ? <EditPointsModal p={edit} onClose={() => setEdit(null)} onSave={(n) => savePoints(edit, n)} busy={rowBusy === edit.id} /> : null}
    </>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(5,4,10,.72)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ViewModal({ p, rank, onClose, onEdit }: { p: Participant; rank: number; onClose: () => void; onEdit: () => void }) {
  const h = hue(p.nick_name);
  const tier = tierFor(p.points);
  return (
    <Backdrop onClose={onClose}>
      <div role="dialog" aria-modal="true" style={{ width: "min(460px, calc(100vw - 32px))", borderRadius: 22, background: "var(--s1)", border: "1px solid var(--ln2)", boxShadow: "var(--sh)", overflow: "hidden", animation: "ymIn .2s cubic-bezier(.2,.8,.2,1)" }}>
        <Stripe />
        <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--ln)" }}>
          <span style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
            {initials(p.nick_name)}
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <b style={{ fontSize: 17 }}>{p.full_name}</b>
            <span style={{ fontSize: 13, color: "var(--fg3)" }}>@{p.nick_name}</span>
          </span>
          <button aria-label="Close" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon n="x" s={16} />
          </button>
        </div>
        <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>POINTS</div>
            <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 22, color: "var(--Yt)", marginTop: 4 }}>{p.points}</div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".07em", color: "var(--fg3)" }}>RANK · TIER</div>
            <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 22, marginTop: 4 }}>
              #{rank} <span style={{ fontFamily: "var(--fu)", fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>{tier.name}</span>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1", padding: "12px 14px", borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon n="mail" s={16} style={{ color: "var(--fg3)" }} />
            <span style={{ fontFamily: "var(--fm)", fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{p.email}</span>
            <CopyBtn value={p.email} label="Copy email" />
          </div>
          <div style={{ gridColumn: "1 / -1", padding: "12px 14px", borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon n="hash" s={16} style={{ color: "var(--fg3)" }} />
            <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, flex: 1, color: "var(--fg2)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{p.id}</span>
            <CopyBtn value={p.id} label="Copy user ID" />
          </div>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--ln)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 14px var(--fu)", cursor: "pointer" }}>
            Close
          </button>
          <button onClick={onEdit} style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 10, background: "var(--btn)", boxShadow: "0 2px 0 var(--btnd)", color: "#fff", font: "700 14px var(--fu)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <Icon n="pencil" s={15} />
            Edit points
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

function EditPointsModal({ p, onClose, onSave, busy }: { p: Participant; onClose: () => void; onSave: (n: number) => void; busy: boolean }) {
  const [pts, setPts] = useState(p.points);
  const h = hue(p.nick_name);
  const t0 = tierFor(p.points);
  const t1 = tierFor(pts);
  const delta = pts - p.points;

  return (
    <Backdrop onClose={onClose}>
      <div role="dialog" aria-modal="true" style={{ width: "min(460px, calc(100vw - 32px))", borderRadius: 22, background: "var(--s1)", border: "1px solid var(--ln2)", boxShadow: "var(--sh)", overflow: "hidden", animation: "ymIn .2s cubic-bezier(.2,.8,.2,1)" }}>
        <Stripe />
        <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--ln)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 700, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
            {initials(p.nick_name)}
          </span>
          <span style={{ display: "flex", flexDirection: "column", flex: 1, lineHeight: 1.3 }}>
            <b style={{ fontSize: 15.5 }}>Edit points</b>
            <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>
              {p.full_name} · @{p.nick_name}
            </span>
          </span>
          <button aria-label="Close" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon n="x" s={16} />
          </button>
        </div>
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <label htmlFor="pts" style={{ fontSize: 13.5, fontWeight: 600 }}>
            Points
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 64px", gap: 10, marginTop: -8 }}>
            <button aria-label="Minus 10" onClick={() => setPts((n) => Math.max(0, n - 10))} style={{ height: 60, borderRadius: 14, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "700 15px var(--fu)", cursor: "pointer" }}>
              −10
            </button>
            <input
              id="pts"
              type="number"
              min={0}
              step={1}
              value={pts}
              onChange={(e) => setPts(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
              style={{
                height: 60,
                borderRadius: 14,
                background: "var(--bg)",
                border: "2px solid var(--B)",
                boxShadow: "0 0 0 4px var(--Bs)",
                textAlign: "center",
                fontFamily: "var(--fd)",
                fontWeight: 800,
                fontSize: 28,
                color: "var(--Yt)",
                outline: 0,
              }}
            />
            <button aria-label="Plus 10" onClick={() => setPts((n) => n + 10)} style={{ height: 60, borderRadius: 14, border: "1px solid var(--ln2)", background: "var(--s2)", color: "var(--fg)", font: "700 15px var(--fu)", cursor: "pointer" }}>
              +10
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--bg)", fontSize: 13.5 }}>
            <span style={{ color: "var(--fg3)" }}>Was {p.points}</span>
            {delta !== 0 ? (
              <span style={{ fontWeight: 700, color: delta > 0 ? "var(--Gt)" : "var(--Rt)" }}>
                {delta > 0 ? "+" : ""}
                {delta}
              </span>
            ) : null}
            {t1.name !== t0.name ? (
              <span style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--Yt)" }}>
                <Icon n="rocket" s={14} />
                {t0.name} → {t1.name}
              </span>
            ) : (
              <span style={{ marginInlineStart: "auto", fontWeight: 600, color: "var(--fg3)" }}>{t1.name}</span>
            )}
          </div>
          <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>Whole numbers, 0 or more. Leaderboard updates after save.</span>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--ln)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 14px var(--fu)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(pts)}
            disabled={busy}
            aria-busy={busy}
            style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 10, background: "var(--btn)", boxShadow: "0 2px 0 var(--btnd)", color: "#fff", font: "700 14px var(--fu)", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
          >
            <span style={{ display: "flex", animation: busy ? "ymSpin .8s linear infinite" : "none" }}>
              <Icon n={busy ? "loader-circle" : "check"} s={15} w={2.5} />
            </span>
            Save points
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
