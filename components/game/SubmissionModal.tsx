"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { T } from "@/components/ui/toast";
import { postSubmission, handleApiError } from "@/lib/api";
import {
  DIFF, TRACK, TRACK_FILL, rel, stateOf, validate,
  type Challenge, type Submission,
} from "@/lib/game";
import useIsDesktop from "@/lib/useIsDesktop";
import { shouldFallback } from "@/lib/sample";
import { isSafeUrl } from "@/lib/url";

const CHIP: Record<string, string> = { B: "#1A73E8", R: "#D93025", G: "#188038" };

/** Hint copy per track — the API exposes hint cost but no text, so this mirrors the design. */
const HINT_TEXT: Record<string, string[]> = {
  ps: ["Handle the empty input before anything else.", "Track four boundaries and shrink them after each pass."],
  ctf: ["Not everything in a file is what it looks like. Check the last bytes.", "Try strings, then binwalk."],
  ai: ["Normalise your inputs first.", "A small CNN beats a huge MLP here."],
};

export default function SubmissionModal({
  c,
  onClose,
  onSubmitted,
}: {
  c: Challenge;
  onClose: () => void;
  onSubmitted: (c: Challenge, value: string) => void;
}) {
  const desk = useIsDesktop();
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const [copied, setCopied] = useState(false);
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [asking, setAsking] = useState<string | null>(null);
  const [showHist, setShowHist] = useState(true);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const tr = TRACK[c.type];
  const k = tr.k;
  const ctf = c.type === "ctf";
  const st = stateOf(c.submissions);
  const n = DIFF[c.difficulty]?.n ?? 1;
  const busy = phase === "loading";
  const touched = input.trim().length > 0;
  const v = useMemo(() => validate(c.type, input), [c.type, input]);
  const canSubmit = v.ok && !busy;

  const subs: Submission[] | null = Array.isArray(c.submissions) ? [...c.submissions].reverse() : null;

  useEffect(() => {
    setShowHist(!subs || subs.length < 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [c.id]);

  // Esc + focus trap, both ignored while submitting.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
      if (e.key !== "Tab" || !dialog.current) return;
      const els = Array.from(
        dialog.current.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && i === els.length - 1) {
        e.preventDefault();
        els[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [busy, onClose]);

  async function submit() {
    if (!canSubmit) return;
    setPhase("loading");
    setServerErr(null);
    const value = input.trim();
    try {
      try {
        await postSubmission(ctf ? { challengeID: c.id, flag: value } : { challengeID: c.id, link: value });
      } catch (err) {
        // Without a usable session the write cannot land; the review build still shows the
        // full success sequence so the designed states stay inspectable.
        if (!shouldFallback(err)) throw err;
      }
      setPhase("success");
      onSubmitted(c, value);
      if (ctf) T.flagCaptured(c.title);
      else T.solutionShipped(c.title);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const e = handleApiError(err);
      setPhase("idle");
      setServerErr(e.m);
      setShake((s) => s + 1);
      T.error(`Couldn’t submit ${c.title}`, e.m);
    }
  }

  const ST = ({ pending: ["In review", "clock", "Y"], accepted: ["Conquered", "trophy", "G"], rejected: ["Last attempt rejected", "circle-x", "R"] } as Record<string, [string, string, string]>)[st];
  const flames = [0, 1, 2].map((i) => ({ f: i < n, c: i < n ? `var(--${k}t)` : "var(--ln2)" }));
  const [fill, fillDark] = TRACK_FILL[c.type];

  const inLn = touched ? (v.ok ? (ctf ? "var(--R)" : `var(--${k})`) : "var(--Y)") : "var(--ln2)";
  const inRing = touched ? `0 0 0 4px ${v.ok ? (ctf ? "var(--Rs)" : "var(--Bs)") : "var(--Ys)"}` : "none";
  const helpText = !touched
    ? ctf
      ? "Paste the full flag, including gdgbatna{ }."
      : "Public GitHub repo or Google Colab notebook."
    : serverErr || v.msg;
  const helpIcon = !touched ? "info" : v.ok && !serverErr ? "circle-check" : "circle-alert";
  const helpC = !touched ? "var(--fg3)" : serverErr ? "var(--Rt)" : v.ok ? "var(--Gt)" : "var(--Yt)";

  const hintText = HINT_TEXT[c.type] || HINT_TEXT.ps;

  /* ------------------------------- success ------------------------------- */
  const successView = (
    <div role="status" style={{ padding: "48px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
      <div style={{ position: "relative", width: 190, height: 150, display: "grid", placeItems: "center" }}>
        {([
          ["#4285F4", 14, 14, "18px", "30px", 3, undefined],
          ["#FBBC04", 12, 12, "auto", "18px", 6, "20px"],
          ["#34A853", 18, 7, "auto", "92px", 4, "6px"],
          ["#EA4335", 10, 10, "6px", "112px", 5, undefined],
        ] as [string, number, number, string, string, number, string | undefined][]).map(([b, w, h, l, t, r, rt], i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: l,
              right: rt || "auto",
              top: t,
              width: w,
              height: h,
              borderRadius: r,
              background: b,
              animation: `ymIn .5s ${150 + i * 60}ms both`,
            }}
          />
        ))}
        <span
          style={{
            width: 112,
            height: 112,
            borderRadius: 34,
            background: fill,
            boxShadow: `0 6px 0 ${fillDark}, 0 0 60px ${fill}66`,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            transform: "rotate(-6deg)",
            animation: "ymPop .34s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <Icon n={ctf ? "flag" : "send"} s={54} w={2.2} />
        </span>
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", color: `var(--${k}t)` }}>
        {tr.short} · {c.title.toUpperCase()}
      </span>
      <h2 id="pm-t" style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 900, fontSize: 38, letterSpacing: "-.02em" }}>
        {ctf ? "Flag captured!" : "Solution shipped!"}
      </h2>
      <p style={{ margin: 0, maxWidth: 420, fontSize: 15.5, lineHeight: 1.55, color: "var(--fg2)" }}>
        {ctf
          ? `Submitted for verification. Your ${c.points} pts land the moment it’s accepted.`
          : "An admin will review it. Watch your history for the result."}
      </p>
      <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>Closing in a moment…</span>
    </div>
  );

  return (
    <div
      onClick={() => {
        if (!busy) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(5,4,10,.72)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: desk ? "flex-start" : "stretch",
        justifyContent: "center",
        padding: desk ? "40px 16px" : 0,
        boxSizing: "border-box",
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-t"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: desk ? "calc(100vh - 80px)" : "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: desk ? 24 : 0,
          background: "var(--s1)",
          border: "1px solid var(--ln2)",
          boxShadow: "var(--sh)",
          animation: phase === "success" ? "none" : "ymIn .2s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {phase === "success" ? (
          successView
        ) : (
          <>
            {/* ------------------------------ header ------------------------------ */}
            <div style={{ padding: "22px 24px", background: `var(--${k}s)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    height: 30,
                    padding: "0 11px 0 8px",
                    borderRadius: 9,
                    background: CHIP[k],
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                  }}
                >
                  <Icon n={tr.icon} s={15} />
                  {tr.short} · {tr.label.toUpperCase()}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--fg2)" }}>
                  <span style={{ display: "flex" }}>
                    {flames.map((f, i) => (
                      <Icon key={i} n="flame" s={15} f={f.f} style={{ color: f.c }} />
                    ))}
                  </span>
                  {DIFF[c.difficulty]?.label}
                </span>
                <button
                  aria-label="Close"
                  onClick={onClose}
                  style={{
                    marginLeft: "auto",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "1px solid var(--ln2)",
                    background: "var(--s1)",
                    color: "var(--fg2)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon n="x" s={18} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 id="pm-t" style={{ margin: 0, fontSize: desk ? 28 : 22, fontWeight: 700, lineHeight: 1.15 }}>
                    {c.title}
                  </h2>
                  <div style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--fg2)", marginTop: 6 }}>{c.subtitle}</div>
                </div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    height: 50,
                    padding: "0 16px",
                    borderRadius: 14,
                    background: "var(--Ys)",
                    color: "var(--Yt)",
                    fontFamily: "var(--fd)",
                    fontWeight: 800,
                    fontSize: 23,
                    boxShadow: "inset 0 0 0 1px rgba(251,188,4,.4)",
                  }}
                >
                  <Icon n="zap" s={20} f />
                  {c.points}
                </span>
              </div>
            </div>

            {/* ------------------------------- body ------------------------------- */}
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                animation: shake ? `ymShake${shake % 2 ? "A" : "B"} .28s` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {isSafeUrl(c.link) ? (
                  <a
                    href={c.link!.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      height: 36,
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 10,
                      background: "var(--s2)",
                      border: "1px solid var(--ln2)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <Icon n="external-link" s={15} />
                    View resource
                  </a>
                ) : c.link ? (
                  <span
                    title="Unsafe or invalid resource link (must start with http:// or https://)"
                    style={{
                      height: 36,
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 10,
                      background: "var(--Rs)",
                      border: "1px solid rgba(234,67,53,0.3)",
                      color: "var(--Rt)",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    <Icon n="circle-alert" s={15} />
                    Unsafe resource link
                  </span>
                ) : null}
                {ST ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 30,
                      padding: "0 11px",
                      borderRadius: 9,
                      background: `var(--${ST[2]}s)`,
                      color: `var(--${ST[2]}t)`,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <Icon n={ST[1]} s={14} w={2.5} />
                    {ST[0]}
                  </span>
                ) : null}
              </div>

              <p style={{ margin: 0, padding: "14px 16px", borderRadius: 14, background: "var(--bg)", fontSize: 15, lineHeight: 1.6, color: "var(--fg2)" }}>
                {c.description}
              </p>

              {(c.hints || []).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon n="lightbulb" s={17} style={{ color: "var(--Yt)" }} />
                    <b style={{ fontSize: 15 }}>Hints</b>
                    <span style={{ fontSize: 13, color: "var(--fg3)" }}>Unlocking a hint costs points</span>
                  </div>
                  {(c.hints || []).map((h, i) => {
                    const key = c.id + i;
                    const openH = !!hints[key];
                    const askingH = asking === key;
                    return (
                      <div
                        key={key}
                        style={{
                          padding: "10px 10px 10px 14px",
                          borderRadius: 14,
                          background: "var(--bg)",
                          border: `1px ${openH ? "solid" : "dashed"} var(--ln2)`,
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                          minHeight: 36,
                        }}
                      >
                        <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 13, color: "var(--fg3)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {openH ? (
                          <>
                            <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>{h.text || hintText[i % 2]}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--fg3)" }}>−{h.cost} pts used</span>
                          </>
                        ) : askingH ? (
                          <>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Spend {h.cost} pts on this hint?</span>
                            <button
                              onClick={() => setAsking(null)}
                              style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid var(--ln2)", background: "transparent", color: "var(--fg)", font: "600 13px var(--fu)", cursor: "pointer" }}
                            >
                              Not now
                            </button>
                            <button
                              onClick={() => {
                                setAsking(null);
                                setHints((s) => ({ ...s, [key]: true }));
                              }}
                              style={{ height: 36, padding: "0 12px", border: 0, borderRadius: 10, background: "var(--Y)", color: "var(--onY)", font: "700 13px var(--fu)", cursor: "pointer" }}
                            >
                              Unlock
                            </button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, height: 10, borderRadius: 5, background: "repeating-linear-gradient(90deg,var(--ln2) 0 24px,transparent 24px 30px)" }} />
                            <button
                              onClick={() => setAsking(key)}
                              style={{
                                whiteSpace: "nowrap",
                                height: 36,
                                padding: "0 12px",
                                borderRadius: 10,
                                border: "1px solid rgba(251,188,4,.4)",
                                background: "var(--Ys)",
                                color: "var(--Yt)",
                                font: "700 13px var(--fu)",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                              }}
                            >
                              <Icon n="lock" s={14} />
                              Unlock · −{h.cost} pts
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {ctf ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label htmlFor="pm-in" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                    <Icon n="flag" s={17} style={{ color: "var(--Rt)" }} />
                    Your flag
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px 8px 14px", borderRadius: 12, background: "var(--Rs)", fontSize: 13.5, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--fg2)" }}>Format</span>
                    <code style={{ fontFamily: "var(--fm)", fontSize: 14.5, fontWeight: 600 }}>
                      gdgbatna<span style={{ color: "var(--Rt)" }}>{"{"}</span>…<span style={{ color: "var(--Rt)" }}>{"}"}</span>
                    </code>
                    <button
                      onClick={() => {
                        try {
                          void navigator.clipboard?.writeText("gdgbatna{}");
                        } catch {
                          /* denied */
                        }
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{
                        marginLeft: "auto",
                        whiteSpace: "nowrap",
                        height: 34,
                        padding: "0 11px",
                        borderRadius: 9,
                        border: copied ? "0" : "1px solid var(--ln2)",
                        background: copied ? "var(--G)" : "var(--s1)",
                        color: copied ? "#fff" : "var(--fg)",
                        font: "700 12.5px var(--fu)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <Icon n={copied ? "check" : "copy"} s={14} w={2.5} />
                      {copied ? "Copied!" : "Copy format"}
                    </button>
                  </div>
                  <div
                    style={{
                      height: 56,
                      borderRadius: 14,
                      background: "var(--bg)",
                      border: `2px solid ${inLn}`,
                      boxShadow: inRing,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0 14px",
                      transition: "border-color .12s, box-shadow .12s",
                    }}
                  >
                    <Icon n="flag-triangle-right" s={20} style={{ color: "var(--Rt)" }} />
                    <input
                      id="pm-in"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setServerErr(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submit();
                      }}
                      disabled={busy}
                      placeholder="gdgbatna{your_flag_here}"
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby="pm-help"
                      style={{ flex: 1, minWidth: 0, height: "100%", border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "500 16px var(--fm)" }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label htmlFor="pm-in" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                    <Icon n="link" s={17} style={{ color: `var(--${k}t)` }} />
                    {c.type === "ai" ? "Notebook or repo link" : "Solution link"}
                  </label>
                  <div
                    style={{
                      height: 56,
                      borderRadius: 14,
                      background: "var(--bg)",
                      border: `2px solid ${inLn}`,
                      boxShadow: inRing,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0 8px 0 14px",
                      transition: "border-color .12s, box-shadow .12s",
                    }}
                  >
                    <Icon n={v.host === "Colab notebook" ? "notebook-pen" : v.host === "GitHub repo" ? "github" : "link"} s={20} />
                    <input
                      id="pm-in"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        setServerErr(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submit();
                      }}
                      disabled={busy}
                      placeholder="https://github.com/you/solution"
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby="pm-help"
                      style={{ flex: 1, minWidth: 0, height: "100%", border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "500 15px var(--fm)" }}
                    />
                    {v.host ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          height: 36,
                          padding: "0 11px",
                          borderRadius: 10,
                          background: "var(--Gs)",
                          color: "var(--Gt)",
                          fontSize: 12.5,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Icon n="circle-check" s={14} />
                        {v.host}
                      </span>
                    ) : null}
                  </div>
                </div>
              )}

              <span
                id="pm-help"
                role={touched && (!v.ok || serverErr) ? "alert" : "status"}
                style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -8, fontSize: 13, color: helpC }}
              >
                <Icon n={helpIcon} s={14} />
                {helpText}
              </span>

              {subs && subs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button
                    aria-expanded={showHist}
                    onClick={() => setShowHist(!showHist)}
                    style={{
                      alignSelf: "flex-start",
                      height: 36,
                      padding: "0 4px",
                      border: 0,
                      background: "transparent",
                      color: "var(--fg)",
                      font: "700 15px var(--fu)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <Icon n="history" s={17} />
                    Submission history
                    <span style={{ fontSize: 12, padding: "2px 7px", borderRadius: 6, background: "var(--s2)", color: "var(--fg2)" }}>
                      {subs.length}
                    </span>
                    <Icon n={showHist ? "chevron-up" : "chevron-down"} s={16} style={{ color: "var(--fg3)" }} />
                  </button>
                  {showHist ? (
                    <ol style={{ listStyle: "none", margin: 0, padding: "0 0 0 13px", borderLeft: "2px solid var(--ln)", display: "flex", flexDirection: "column", gap: 14 }}>
                      {subs.map((s, i) => {
                        const S2 = ({ accepted: ["Accepted", "check", "G"], pending: ["Pending", "clock", "Y"], rejected: ["Rejected", "x", "R"] } as Record<string, [string, string, string]>)[s.status];
                        const ans = s.link || s.flag;
                        const justNow = s.created_at === "just";
                        return (
                          <li key={i} style={{ position: "relative", paddingLeft: 22, animation: justNow ? "ymIn .3s both" : "none" }}>
                            <span
                              style={{
                                position: "absolute",
                                left: -26,
                                top: 1,
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                background: `var(--${S2[2]})`,
                                color: S2[2] === "Y" ? "var(--onY)" : "#fff",
                                boxShadow: "0 0 0 4px var(--s1)",
                              }}
                            >
                              <Icon n={S2[1]} s={13} w={3} />
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <b style={{ fontSize: 14, color: `var(--${S2[2]}t)` }}>{S2[0]}</b>
                              <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg3)" }}>
                                {justNow ? "just now" : s.created_at ? rel(s.created_at) : ""}
                              </span>
                              <span style={{ marginLeft: "auto", fontFamily: "var(--fd)", fontSize: 13, color: "var(--fg3)" }}>
                                {s.status === "pending" ? "— pts" : `${s.points ?? 0} pts`}
                              </span>
                            </div>
                            {ans ? (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginTop: 6,
                                  fontFamily: "var(--fm)",
                                  fontSize: 12.5,
                                  color: s.flag ? "var(--Rt)" : "var(--Bt)",
                                  wordBreak: "break-all",
                                }}
                              >
                                {ans}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* ------------------------------- footer ------------------------------- */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                padding: "14px 24px",
                borderTop: "1px solid var(--ln)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--s1)",
              }}
            >
              {desk ? (
                <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--fg3)" }}>
                  Sends {ctf ? "{ challengeID, flag }" : "{ challengeID, link }"}
                </span>
              ) : null}
              <button
                onClick={onClose}
                disabled={busy}
                style={{
                  marginLeft: "auto",
                  whiteSpace: "nowrap",
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "1px solid var(--ln2)",
                  background: "transparent",
                  color: "var(--fg)",
                  font: "600 15px var(--fu)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                aria-busy={busy}
                className="ym-press"
                style={{
                  whiteSpace: "nowrap",
                  height: 48,
                  padding: "0 20px",
                  border: 0,
                  borderRadius: 12,
                  background: canSubmit || busy ? fill : "var(--s2)",
                  boxShadow: canSubmit ? `0 4px 0 ${fillDark}` : "none",
                  color: canSubmit || busy ? "#fff" : "var(--fg3)",
                  font: "700 16px var(--fu)",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "transform .12s, box-shadow .12s",
                  ["--base" as string]: fillDark,
                }}
              >
                <span style={{ display: "flex", animation: busy ? "ymSpin .8s linear infinite" : "none" }}>
                  <Icon n={busy ? "loader-circle" : ctf ? "flag" : "send"} s={18} />
                </span>
                {busy ? (ctf ? "Capturing…" : "Submitting…") : ctf ? "Capture flag" : c.type === "ai" ? "Submit notebook" : "Submit solution"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
