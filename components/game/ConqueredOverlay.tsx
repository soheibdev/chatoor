"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useReducedMotion } from "@/lib/useIsDesktop";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

export interface Celebration {
  caps: string;
  pts: number;
  before: number | null;
  after: number;
  up: boolean;
  diff: number;
  tierLine: string;
  toGo: string;
  pct: string;
}

function Confetti() {
  const pieces = useMemo(() => {
    const cols = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
    return Array.from({ length: 44 }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const d = 140 + Math.random() * 260;
      return {
        i,
        w: i % 3 ? 11 : 8,
        h: i % 3 ? 6 : 8,
        r: i % 2 ? 2 : "50%",
        bg: cols[i % 4],
        dx: Math.cos(a) * d + "px",
        dy: Math.sin(a) * d + 140 + "px",
        rot: Math.random() * 720 - 360 + "deg",
        dur: 900 + Math.random() * 600,
        delay: Math.random() * 120,
      };
    });
  }, []);
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            width: p.w,
            height: p.h,
            borderRadius: p.r,
            background: p.bg,
            ["--dx" as string]: p.dx,
            ["--dy" as string]: p.dy,
            ["--r" as string]: p.rot,
            animation: `ymConf ${p.dur}ms cubic-bezier(.16,1,.3,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function ConqueredOverlay({ cel, onClose }: { cel: Celebration; onClose: () => void }) {
  const router = useRouter();
  const rm = useReducedMotion();

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,4,10,.72)", display: "grid", placeItems: "center", padding: 16 }}
    >
      {rm ? null : <Confetti />}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cel-t"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          borderRadius: 26,
          overflow: "hidden",
          background: "var(--s1)",
          border: "1px solid var(--Y)",
          boxShadow: "0 0 0 6px var(--Ys),0 0 80px rgba(251,188,4,.25)",
          padding: "36px 28px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
          animation: "ymIn .32s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", height: 4 }}>
          {COLS.map((c) => (
            <span key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <span style={{ width: 92, height: 92, borderRadius: "50%", background: "var(--G)", display: "grid", placeItems: "center", color: "#fff", boxShadow: "0 0 0 8px var(--Gs)" }}>
          <Icon n="check" s={50} w={3} />
        </span>
        <span style={{ marginTop: 6, fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", color: "var(--Gt)" }}>
          {cel.caps} · ACCEPTED
        </span>
        <h2 id="cel-t" style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 900, fontSize: 42, letterSpacing: "-.02em" }}>
          Conquered!
        </h2>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 56,
            padding: "0 20px",
            borderRadius: 16,
            background: "var(--Y)",
            color: "var(--onY)",
            fontFamily: "var(--fd)",
            fontWeight: 900,
            fontSize: 28,
          }}
        >
          <Icon n="zap" s={24} f />+{cel.pts} pts
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, width: "100%", marginTop: 8 }}>
          {cel.before != null ? (
            <div style={{ padding: 14, borderRadius: 14, background: "var(--bg)", display: "flex", flexDirection: "column", gap: 6, textAlign: "start" }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", color: "var(--fg3)" }}>RANK</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--fd)", fontWeight: 700, fontSize: 22 }}>
                <span style={{ color: "var(--fg3)", textDecoration: "line-through", fontSize: 15 }}>#{cel.before}</span>
                <Icon n="arrow-right" s={15} style={{ color: "var(--fg3)" }} />#{cel.after}
                {cel.up ? (
                  <span style={{ fontFamily: "var(--fu)", fontSize: 12, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: "var(--Gs)", color: "var(--Gt)" }}>
                    +{cel.diff}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}
          <div style={{ padding: 14, borderRadius: 14, background: "var(--bg)", display: "flex", flexDirection: "column", gap: 8, textAlign: "start" }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11.5, fontWeight: 800, letterSpacing: ".06em", color: "var(--fg3)" }}>
              {cel.tierLine}
              <span style={{ color: "var(--Yt)" }}>{cel.toGo}</span>
            </span>
            <span style={{ height: 10, borderRadius: 5, background: "var(--ln)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", background: "var(--Y)", width: cel.pct }} />
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{ height: 46, padding: "0 18px", borderRadius: 12, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 15px var(--fu)", cursor: "pointer" }}
          >
            Keep solving
          </button>
          <button
            onClick={() => {
              onClose();
              router.push("/leaderboard");
              window.scrollTo(0, 0);
            }}
            className="ym-press"
            style={{
              height: 46,
              padding: "0 18px",
              border: 0,
              borderRadius: 12,
              background: "var(--Y)",
              boxShadow: "0 4px 0 #C48F00",
              color: "var(--onY)",
              font: "700 15px var(--fu)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              ["--base" as string]: "#C48F00",
            }}
          >
            <Icon n="trophy" s={17} />
            See the leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
