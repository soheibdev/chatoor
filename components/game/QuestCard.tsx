"use client";

import Icon from "@/components/ui/Icon";
import { DIFF, TRACK, stateOf, type Challenge, type QuestState } from "@/lib/game";

/** Port of YmQuestCard.dc.html — grid and list views, 5 states. */
export default function QuestCard({
  c,
  view = "grid",
  onOpen,
}: {
  c: Challenge;
  view?: "grid" | "list";
  onOpen: (c: Challenge) => void;
}) {
  const tr = TRACK[c.type] || TRACK.ps;
  const k = tr.k;
  const state: QuestState = stateOf(c.submissions);
  const n = DIFF[c.difficulty]?.n ?? 1;
  const won = state === "accepted";
  const earned = won ? ((c.submissions || []).find((s) => s.status === "accepted")?.points ?? c.points) : 0;

  const STATES: Record<QuestState, [string, string, string, string]> = {
    new: ["Start", "arrow-right", `var(--${k}s)`, `var(--${k}t)`],
    unknown: ["Start", "arrow-right", `var(--${k}s)`, `var(--${k}t)`],
    pending: ["In review", "clock", "var(--Ys)", "var(--Yt)"],
    rejected: ["Retry", "rotate-ccw", "var(--Rs)", "var(--Rt)"],
    accepted: ["Conquered", "trophy", "var(--Gs)", "var(--Gt)"],
  };
  const ST = [...STATES[state]] as [string, string, string, string];
  if (c.type === "ctf" && state === "new") ST[0] = "Hack it";

  const diffLabel = DIFF[c.difficulty]?.label ?? "Easy";
  const tc = `var(--${k})`;
  const ts = `var(--${k}s)`;
  const tt = `var(--${k}t)`;
  const cardBg = won ? "color-mix(in oklab, var(--G) 7%, var(--s1))" : "var(--s1)";
  const cardLn = won ? "color-mix(in oklab, var(--G) 45%, var(--ln))" : "var(--ln)";
  const glow = `0 14px 36px -12px color-mix(in oklab, var(--${k}) 55%, transparent)`;
  const flames = [0, 1, 2].map((i) => ({ f: i < n, c: i < n ? tt : "var(--ln2)" }));
  const ptBg = won ? "var(--Y)" : "var(--Ys)";
  const ptFg = won ? "var(--onY)" : "var(--Yt)";
  const ptLabel = won ? "+" + earned : c.points;
  const ptUnit = won ? "earned" : "pts";
  const aria = `${tr.short} challenge: ${c.title}, ${diffLabel}, ${c.points} points, ${ST[0]}`;

  const open = () => onOpen(c);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  if (view === "list") {
    return (
      <article
        tabIndex={0}
        role="button"
        aria-label={aria}
        onClick={open}
        onKeyDown={onKey}
        className="ym-rowcard"
        style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(0,1fr) 130px 120px 140px",
          alignItems: "center",
          gap: 18,
          padding: "14px 18px",
          borderRadius: 14,
          background: cardBg,
          border: `1px solid ${cardLn}`,
          fontFamily: "var(--fu)",
          color: "var(--fg)",
          cursor: "pointer",
          transition: "border-color .15s, background .15s",
          ["--tc" as string]: tc,
        }}
      >
        <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: ts, color: tt }}>
          <Icon n={tr.icon} s={19} />
        </span>
        <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: tt }}>{tr.short}</span>
            {c.title}
            {won ? (
              <span style={{ width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--G)", color: "#fff" }}>
                <Icon n="check" s={12} w={3} />
              </span>
            ) : null}
          </span>
          <span style={{ fontSize: 13, color: "var(--fg3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ fontFamily: "var(--fm)" }}>{c.subtitle}</span> · {c.description}
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "flex", gap: 1 }}>
            {flames.map((f, i) => (
              <Icon key={i} n="flame" s={14} f={f.f} style={{ color: f.c }} />
            ))}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--fg2)" }}>{diffLabel}</span>
        </span>
        <span
          style={{
            justifySelf: "start",
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 30,
            padding: "0 10px",
            borderRadius: 9,
            background: ptBg,
            color: ptFg,
            fontFamily: "var(--fd)",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <Icon n="zap" s={13} f />
          {ptLabel}
        </span>
        <span
          style={{
            justifySelf: "end",
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 32,
            padding: "0 12px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            background: ST[2],
            color: ST[3],
          }}
        >
          <Icon n={ST[1]} s={14} w={2.5} />
          {ST[0]}
        </span>
      </article>
    );
  }

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={aria}
      onClick={open}
      onKeyDown={onKey}
      className="ym-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: 18,
        background: cardBg,
        border: `1px solid ${cardLn}`,
        overflow: "hidden",
        fontFamily: "var(--fu)",
        color: "var(--fg)",
        cursor: "pointer",
        transition: "transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s, border-color .18s",
        ["--tc" as string]: tc,
        ["--glow" as string]: glow,
      }}
    >
      <div style={{ height: 4, background: tc }} />
      <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: ts, color: tt }}>
          <Icon n={tr.icon} s={18} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 3, lineHeight: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: tt }}>{tr.short}</span>
          <span style={{ fontSize: 11.5, color: "var(--fg3)" }}>{tr.label}</span>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "flex", gap: 1, color: tt }}>
            {flames.map((f, i) => (
              <Icon key={i} n="flame" s={15} f={f.f} style={{ color: f.c }} />
            ))}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg2)" }}>{diffLabel}</span>
        </span>
      </div>
      <div style={{ padding: "14px 18px 0", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <h3 style={{ margin: 0, flex: 1, fontSize: 19, fontWeight: 700, lineHeight: 1.25, textWrap: "pretty" }}>{c.title}</h3>
          {won ? (
            <span
              title="Conquered"
              style={{
                flex: "none",
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--G)",
                color: "#fff",
                boxShadow: "0 0 0 4px var(--Gs)",
              }}
            >
              <Icon n="check" s={17} w={3} />
            </span>
          ) : null}
        </div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--fg3)", marginTop: 5 }}>{c.subtitle}</div>
        <p className="ym-clamp2" style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--fg2)" }}>
          {c.description}
        </p>
      </div>
      <div
        style={{
          marginTop: 16,
          padding: "14px 18px",
          borderTop: "1px dashed var(--ln)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 12px",
            borderRadius: 10,
            background: ptBg,
            color: ptFg,
            fontFamily: "var(--fd)",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          <Icon n="zap" s={15} f />
          {ptLabel}
          <span style={{ fontFamily: "var(--fu)", fontWeight: 600, fontSize: 12 }}>{ptUnit}</span>
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            padding: "0 12px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            background: ST[2],
            color: ST[3],
          }}
        >
          <Icon n={ST[1]} s={15} w={2.5} />
          {ST[0]}
        </span>
      </div>
    </article>
  );
}
