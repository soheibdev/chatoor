"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/toast";
import {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  type CreateChallengeInput,
  type EditChallengeInput,
} from "@/lib/api";
import { useAdminChallenges } from "@/lib/useData";
import { DIFF, TRACK, type Challenge, type DiffKey, type TrackKey } from "@/lib/game";
import { isSafeUrl } from "@/lib/url";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];
const PAGE_SIZE = 10;

function Stripe() {
  return (
    <div aria-hidden="true" style={{ display: "flex", height: 3 }}>
      {COLS.map((c) => (
        <span key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

const TRACK_OPTIONS: { key: TrackKey; label: string; icon: string }[] = [
  { key: "ps", label: "Problem Solving", icon: "code-xml" },
  { key: "ctf", label: "Cybersecurity (CTF)", icon: "shield" },
  { key: "ai", label: "AI / ML", icon: "brain" },
];

const DIFF_OPTIONS: { key: DiffKey; label: string; pips: number; color: string }[] = [
  { key: "easy", label: "Easy", pips: 1, color: "var(--Gt)" },
  { key: "medium", label: "Medium", pips: 2, color: "var(--Yt)" },
  { key: "hard", label: "Hard", pips: 3, color: "var(--Rt)" },
];

export default function ChallengesAdminView() {
  const qc = useQueryClient();
  const { data: challenges, isLoading, isError, error, refetch } = useAdminChallenges({ status: "all" });

  const [q, setQ] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [mobile, setMobile] = useState(false);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Challenge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Challenge | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allChallenges = challenges ?? [];

  // Statistics
  const totalCount = allChallenges.length;
  const activeCount = allChallenges.filter((c) => c.isActive !== false).length;
  const inactiveCount = allChallenges.filter((c) => c.isActive === false).length;
  const totalPoints = allChallenges.reduce((sum, c) => sum + (c.points || 0), 0);

  // Filter & Search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allChallenges.filter((c) => {
      const matchTrack = trackFilter === "all" || c.type === trackFilter;
      const matchDiff =
        diffFilter === "all" ||
        c.difficulty === diffFilter ||
        (diffFilter === "easy" && c.difficulty === ("low" as any)) ||
        (diffFilter === "hard" && c.difficulty === ("high" as any));
      const isActive = c.isActive !== false;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);
      const matchTerm =
        !term ||
        [c.title, c.subtitle, c.description, c.type, c.difficulty]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchTrack && matchDiff && matchStatus && matchTerm;
    });
  }, [allChallenges, q, trackFilter, diffFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedChallenges = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Quick toggle active state
  async function handleToggleActive(c: Challenge) {
    const nextState = c.isActive === false ? true : false;
    setActionBusy(c.id);
    try {
      await updateChallenge(c.id, { isActive: nextState });
      qc.setQueryData<Challenge[]>(["admin-challenges"], (old) =>
        (old ?? []).map((item) => (item.id === c.id ? { ...item, isActive: nextState } : item))
      );
      void qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      void qc.invalidateQueries({ queryKey: ["challange"] });
      showToast({
        icon: nextState ? "circle-check" : "circle-dashed",
        bg: nextState ? "var(--Gs)" : "var(--s2)",
        fg: nextState ? "var(--Gt)" : "var(--fg2)",
        title: nextState ? "Challenge activated" : "Challenge deactivated",
        msg: `"${c.title}" is now ${nextState ? "visible to participants" : "hidden from participants"}.`,
      });
    } catch {
      showToast({
        icon: "circle-alert",
        bg: "var(--Rs)",
        fg: "var(--Rt)",
        title: "Action failed",
        msg: "Failed to update challenge status.",
        error: true,
      });
    } finally {
      setActionBusy(null);
    }
  }

  // Handle Safe Delete / Deactivate
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setActionBusy(deleteTarget.id);
    try {
      const res = await deleteChallenge(deleteTarget.id);
      const wasDeactivated = res.data?.deactivated || !res.data?.deleted;
      void qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      void qc.invalidateQueries({ queryKey: ["challange"] });
      showToast({
        icon: wasDeactivated ? "shield-check" : "circle-check",
        bg: wasDeactivated ? "var(--Ys)" : "var(--Gs)",
        fg: wasDeactivated ? "var(--Yt)" : "var(--Gt)",
        title: wasDeactivated ? "Challenge safely archived" : "Challenge removed",
        msg: wasDeactivated
          ? `Preserved submission history. "${deleteTarget.title}" has been set to inactive.`
          : `"${deleteTarget.title}" was permanently deleted.`,
      });
      setDeleteTarget(null);
    } catch {
      showToast({
        icon: "circle-alert",
        bg: "var(--Rs)",
        fg: "var(--Rt)",
        title: "Deletion failed",
        msg: "The server rejected the deletion request.",
        error: true,
      });
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <div style={{ padding: mobile ? "16px" : "28px 36px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: "var(--Bs)", color: "var(--Bt)" }}>
              <Icon n="swords" s={18} />
            </span>
            <h1 style={{ margin: 0, fontSize: mobile ? 22 : 26, fontWeight: 700, letterSpacing: "-.02em" }}>Challenges Management</h1>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--fg3)" }}>
            Create, edit, toggle visibility, and monitor challenges across all tournament tracks.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 18px",
            borderRadius: 10,
            background: "var(--B)",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Icon n="plus" s={16} w={2.5} />
          Create Challenge
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Challenges", value: isLoading ? "…" : totalCount, icon: "swords", c: "var(--Bt)" },
          { label: "Active", value: isLoading ? "…" : activeCount, icon: "zap", c: "var(--Gt)" },
          { label: "Inactive (Archived)", value: isLoading ? "…" : inactiveCount, icon: "ban", c: "var(--Rt)" },
          { label: "Points Pool", value: isLoading ? "…" : `${totalPoints.toLocaleString()} pts`, icon: "trophy", c: "var(--Yt)" },
        ].map((st, i) => (
          <div
            key={i}
            style={{
              background: "var(--s1)",
              border: "1px solid var(--ln)",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--s2)", display: "grid", placeItems: "center", color: st.c }}>
              <Icon n={st.icon} s={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 500 }}>{st.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--fg)", marginTop: 2 }}>{st.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--ln)",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--fg3)", pointerEvents: "none" }}>
            <Icon n="search" s={15} />
          </span>
          <input
            type="text"
            placeholder="Search by title, track, keywords…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              height: 38,
              padding: "0 34px 0 36px",
              borderRadius: 9,
              border: "1px solid var(--ln2)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13.5,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--fg3)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Icon n="x" s={14} />
            </button>
          )}
        </div>

        {/* Track Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 500 }}>Track:</span>
          <select
            value={trackFilter}
            onChange={(e) => {
              setTrackFilter(e.target.value);
              setPage(1);
            }}
            style={{
              height: 38,
              padding: "0 10px",
              borderRadius: 9,
              border: "1px solid var(--ln2)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Tracks</option>
            <option value="ps">Problem Solving (PS)</option>
            <option value="ctf">Cybersecurity (CTF)</option>
            <option value="ai">AI / ML (AI)</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 500 }}>Level:</span>
          <select
            value={diffFilter}
            onChange={(e) => {
              setDiffFilter(e.target.value);
              setPage(1);
            }}
            style={{
              height: 38,
              padding: "0 10px",
              borderRadius: 9,
              border: "1px solid var(--ln2)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 500 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              height: 38,
              padding: "0 10px",
              borderRadius: 9,
              border: "1px solid var(--ln2)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Challenges List / Table */}
      <div style={{ background: "var(--s1)", border: "1px solid var(--ln)", borderRadius: 14, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--fg3)" }}>
            <span style={{ display: "inline-block", animation: "ymSpin .8s linear infinite", marginBottom: 12 }}>
              <Icon n="loader-circle" s={26} />
            </span>
            <div>Loading challenges…</div>
          </div>
        ) : isError ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--Rt)" }}>
            <Icon n="circle-alert" s={28} />
            <div style={{ marginTop: 10, fontWeight: 600 }}>Failed to load challenges</div>
            <p style={{ fontSize: 13, color: "var(--fg3)", maxWidth: 400, margin: "6px auto 16px" }}>
              {(error as Error)?.message || "The backend could not be reached."}
            </p>
            <button
              onClick={() => void refetch()}
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--s2)",
                color: "var(--fg)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : pagedChallenges.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--fg3)" }}>
            <Icon n="swords" s={32} />
            <div style={{ marginTop: 12, fontWeight: 600, fontSize: 16, color: "var(--fg)" }}>No challenges found</div>
            <p style={{ fontSize: 13, maxWidth: 360, margin: "6px auto 16px" }}>
              No challenges match your current search and filter criteria.
            </p>
            {(q || trackFilter !== "all" || diffFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setQ("");
                  setTrackFilter("all");
                  setDiffFilter("all");
                  setStatusFilter("all");
                  setPage(1);
                }}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid var(--ln2)",
                  background: "var(--s2)",
                  color: "var(--fg)",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--ln)", background: "var(--s2)", color: "var(--fg3)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  <th style={{ padding: "12px 18px", width: 140 }}>Track</th>
                  <th style={{ padding: "12px 18px" }}>Challenge</th>
                  <th style={{ padding: "12px 18px", width: 110 }}>Difficulty</th>
                  <th style={{ padding: "12px 18px", width: 100 }}>Points</th>
                  <th style={{ padding: "12px 18px", width: 120 }}>Status</th>
                  <th style={{ padding: "12px 18px", width: 150, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedChallenges.map((c) => {
                  const trk = TRACK[c.type] || TRACK.ps;
                  const normalizedDiff = (c.difficulty === ("low" as any) ? "easy" : c.difficulty === ("high" as any) ? "hard" : c.difficulty) as DiffKey;
                  const diffObj = DIFF[normalizedDiff] || DIFF.medium;
                  const isActive = c.isActive !== false;
                  const isBusy = actionBusy === c.id;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid var(--ln)",
                        opacity: isActive ? 1 : 0.65,
                        transition: "background 0.15s, opacity 0.2s",
                      }}
                    >
                      {/* Track */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 9px",
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 600,
                            background: `var(--${trk.k}s)`,
                            color: `var(--${trk.k}t)`,
                          }}
                        >
                          <Icon n={trk.icon} s={13} />
                          {trk.short}
                        </span>
                      </td>

                      {/* Title & Subtitle */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600, color: "var(--fg)", fontSize: 14 }}>{c.title}</div>
                        {(c.subtitle || c.description) && (
                          <div style={{ fontSize: 12.5, color: "var(--fg3)", marginTop: 2, maxWidth: 440, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.subtitle || c.description}
                          </div>
                        )}
                        {c.link && isSafeUrl(c.link) && (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--Bt)", marginTop: 3, textDecoration: "none" }}
                          >
                            <Icon n="external-link" s={11} />
                            {c.link.length > 40 ? c.link.slice(0, 38) + "…" : c.link}
                          </a>
                        )}
                      </td>

                      {/* Difficulty */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: normalizedDiff === "easy" ? "var(--Gt)" : normalizedDiff === "hard" ? "var(--Rt)" : "var(--Yt)",
                          }}
                        >
                          <span style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: 3 }).map((_, idx) => (
                              <span
                                key={idx}
                                style={{
                                  width: 4,
                                  height: 8,
                                  borderRadius: 2,
                                  background: idx < diffObj.n ? "currentColor" : "var(--ln2)",
                                }}
                              />
                            ))}
                          </span>
                          {diffObj.label}
                        </span>
                      </td>

                      {/* Points */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--Yt)" }}>
                          {c.points} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--fg3)" }}>pts</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <button
                          onClick={() => handleToggleActive(c)}
                          disabled={isBusy}
                          title={`Click to ${isActive ? "deactivate" : "activate"}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            border: "1px solid var(--ln2)",
                            background: isActive ? "var(--Gs)" : "var(--s2)",
                            color: isActive ? "var(--Gt)" : "var(--fg3)",
                            cursor: isBusy ? "wait" : "pointer",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: isActive ? "var(--Gt)" : "var(--fg3)",
                            }}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            onClick={() => setEditTarget(c)}
                            title="Edit Challenge"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "1px solid var(--ln2)",
                              background: "transparent",
                              color: "var(--fg2)",
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Icon n="pencil" s={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            title="Delete / Archive Challenge"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "1px solid var(--ln2)",
                              background: "transparent",
                              color: "var(--Rt)",
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Icon n="ban" s={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--ln)", background: "var(--s2)", fontSize: 13 }}>
            <span style={{ color: "var(--fg3)" }}>
              Page {currentPage} of {totalPages} ({filtered.length} challenges)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 6,
                  border: "1px solid var(--ln2)",
                  background: "var(--s1)",
                  color: currentPage <= 1 ? "var(--fg3)" : "var(--fg)",
                  cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 6,
                  border: "1px solid var(--ln2)",
                  background: "var(--s1)",
                  color: currentPage >= totalPages ? "var(--fg3)" : "var(--fg)",
                  cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CHALLENGE MODAL */}
      {createOpen && (
        <ChallengeFormModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            void qc.invalidateQueries({ queryKey: ["admin-challenges"] });
            void qc.invalidateQueries({ queryKey: ["challange"] });
          }}
        />
      )}

      {/* EDIT CHALLENGE MODAL */}
      {editTarget && (
        <ChallengeFormModal
          mode="edit"
          initialData={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            void qc.invalidateQueries({ queryKey: ["admin-challenges"] });
            void qc.invalidateQueries({ queryKey: ["challange"] });
          }}
        />
      )}

      {/* DELETE / ARCHIVE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          onClick={() => !actionBusy && setDeleteTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(5,4,10,0.65)",
            backdropFilter: "blur(2px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(460px, 100%)",
              background: "var(--s1)",
              border: "1px solid var(--ln2)",
              borderRadius: 16,
              boxShadow: "var(--sh)",
              overflow: "hidden",
            }}
          >
            <Stripe />
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--Rt)" }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--Rs)", display: "grid", placeItems: "center" }}>
                  <Icon n="circle-alert" s={20} />
                </span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--fg)" }}>Delete / Archive Challenge</h3>
              </div>

              <p style={{ margin: "14px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--fg2)" }}>
                Are you sure you want to remove <strong>"{deleteTarget.title}"</strong> ({deleteTarget.points} pts)?
              </p>

              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--s2)",
                  border: "1px solid var(--ln2)",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--fg3)",
                }}
              >
                <div style={{ display: "flex", gap: 6, fontWeight: 600, color: "var(--Yt)", marginBottom: 4 }}>
                  <Icon n="shield" s={14} /> Relational Integrity Protection
                </div>
                If participants have already submitted answers for this challenge, it will be automatically <strong>deactivated and archived</strong> instead of hard deleted, protecting tournament scores and submission logs.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                <button
                  type="button"
                  disabled={actionBusy === deleteTarget.id}
                  onClick={() => setDeleteTarget(null)}
                  style={{
                    height: 38,
                    padding: "0 16px",
                    borderRadius: 9,
                    border: "1px solid var(--ln2)",
                    background: "transparent",
                    color: "var(--fg2)",
                    cursor: "pointer",
                    fontSize: 13.5,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionBusy === deleteTarget.id}
                  onClick={handleConfirmDelete}
                  style={{
                    height: 38,
                    padding: "0 18px",
                    borderRadius: 9,
                    border: "none",
                    background: "var(--R)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: actionBusy === deleteTarget.id ? "wait" : "pointer",
                    fontSize: 13.5,
                  }}
                >
                  {actionBusy === deleteTarget.id ? "Processing…" : "Confirm Deactivation / Deletion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** CREATE / EDIT CHALLENGE MODAL */
function ChallengeFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  initialData?: Challenge;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<TrackKey>(initialData?.type || "ps");
  const normalizedDiff =
    initialData?.difficulty === ("low" as any)
      ? "easy"
      : initialData?.difficulty === ("high" as any)
      ? "hard"
      : (initialData?.difficulty as DiffKey) || "easy";
  const [difficulty, setDifficulty] = useState<DiffKey>(normalizedDiff);
  const [points, setPoints] = useState<number>(initialData?.points ?? 100);
  const [link, setLink] = useState(initialData?.link || "");
  const [flag, setFlag] = useState("");
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive !== false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Challenge title is required.");
      return;
    }
    if (points <= 0) {
      setFormError("Points must be a positive number.");
      return;
    }
    if (type === "ctf" && mode === "create" && !flag.trim()) {
      setFormError("CTF challenges require a secret Flag string.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "create") {
        const body: CreateChallengeInput = {
          title: title.trim(),
          subTitle: subtitle.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          description: description.trim() || undefined,
          type,
          difficulty,
          points: Number(points),
          link: link.trim() || undefined,
          isActive,
        };
        if (type === "ctf" && flag.trim()) {
          body.flag = flag.trim();
        }
        await createChallenge(body);
        showToast({
          icon: "circle-check",
          bg: "var(--Gs)",
          fg: "var(--Gt)",
          title: "Challenge created",
          msg: `"${title.trim()}" has been added to ${TRACK[type].label}.`,
        });
      } else if (initialData) {
        const body: EditChallengeInput = {
          title: title.trim(),
          subTitle: subtitle.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          description: description.trim() || undefined,
          type,
          difficulty,
          points: Number(points),
          link: link.trim() || undefined,
          isActive,
        };
        if (type === "ctf" && flag.trim()) {
          body.flag = flag.trim();
        }
        await updateChallenge(initialData.id, body);
        showToast({
          icon: "circle-check",
          bg: "var(--Gs)",
          fg: "var(--Gt)",
          title: "Challenge updated",
          msg: `Saved changes to "${title.trim()}".`,
        });
      }
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save challenge.";
      setFormError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => !busy && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(5,4,10,0.65)",
        backdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "90vh",
          background: "var(--s1)",
          border: "1px solid var(--ln2)",
          borderRadius: 16,
          boxShadow: "var(--sh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stripe />
        <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--ln)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--Bs)", color: "var(--Bt)", display: "grid", placeItems: "center" }}>
              <Icon n={mode === "create" ? "plus" : "pencil"} s={16} />
            </span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {mode === "create" ? "Create New Challenge" : "Edit Challenge"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
          >
            <Icon n="x" s={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {formError && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--Rs)", color: "var(--Rt)", fontSize: 13, border: "1px solid rgba(234,67,53,0.3)" }}>
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Title <span style={{ color: "var(--Rt)" }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Reverse Binary Matrix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Subtitle (Short hook / topic)
            </label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming & Bitmask"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Track and Difficulty row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
                Track <span style={{ color: "var(--Rt)" }}>*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TrackKey)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid var(--ln2)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                {TRACK_OPTIONS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
                Difficulty <span style={{ color: "var(--Rt)" }}>*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DiffKey)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid var(--ln2)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                {DIFF_OPTIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label} ({d.pips} {d.pips === 1 ? "pip" : "pips"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Points */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Points <span style={{ color: "var(--Rt)" }}>*</span>
            </label>
            <input
              type="number"
              min={10}
              step={10}
              required
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Link (for PS / AI) */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Challenge External Link / Repo URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/... or https://codeforces.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Flag (for CTF) */}
          {type === "ctf" && (
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
                Secret Flag {mode === "create" ? <span style={{ color: "var(--Rt)" }}>*</span> : "(Leave empty to keep existing flag)"}
              </label>
              <input
                type="text"
                placeholder="gdg{s3cr3t_fl4g_h3r3}"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid var(--ln2)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--fg2)", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Detailed instructions or context for participants…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Active status checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 17, height: 17, cursor: "pointer", accentColor: "var(--B)" }}
            />
            <label htmlFor="isActiveCheck" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)", cursor: "pointer" }}>
              Active (Visible to participants in the Arena)
            </label>
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid var(--ln2)",
                background: "transparent",
                color: "var(--fg2)",
                cursor: "pointer",
                fontSize: 13.5,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{
                height: 38,
                padding: "0 20px",
                borderRadius: 8,
                border: "none",
                background: "var(--B)",
                color: "#fff",
                fontWeight: 600,
                cursor: busy ? "wait" : "pointer",
                fontSize: 13.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {busy ? (
                <>
                  <span style={{ animation: "ymSpin .8s linear infinite" }}>
                    <Icon n="loader-circle" s={14} />
                  </span>
                  Saving…
                </>
              ) : mode === "create" ? (
                "Create Challenge"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
