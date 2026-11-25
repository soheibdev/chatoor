"use client";

import toast from "react-hot-toast";
import Icon from "./Icon";

export interface YmToast {
  icon: string;
  bg: string;
  fg: string;
  title: string;
  msg: string;
  /** filled icon, like ym-icon f="1" */
  f?: boolean;
  ms?: number;
  error?: boolean;
  cta?: { label: string; onClick: () => void };
}

/** The design's toast: r16, --s2, 1px --ln2, --sh, 36px icon tile, 14.5/13px text, 32px dismiss. */
export function showToast(t: YmToast) {
  return toast.custom(
    (to) => (
      <div
        role="status"
        aria-live={t.error ? "assertive" : "polite"}
        style={{
          width: "min(440px, calc(100vw - 24px))",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px 12px 12px",
          borderRadius: 16,
          background: "var(--s2)",
          border: "1px solid var(--ln2)",
          boxShadow: "var(--sh)",
          boxSizing: "border-box",
          opacity: to.visible ? 1 : 0,
          animation: to.visible ? "ymIn .2s cubic-bezier(.2,.8,.2,1)" : undefined,
          transition: "opacity .2s",
          fontFamily: "var(--fu)",
          color: "var(--fg)",
        }}
      >
        <span
          style={{
            flex: "none",
            width: 36,
            height: 36,
            borderRadius: 11,
            display: "grid",
            placeItems: "center",
            background: t.bg,
            color: t.fg,
          }}
        >
          <Icon n={t.icon} s={18} w={2.5} f={t.f} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <b style={{ fontSize: 14.5 }}>{t.title}</b>
          <span style={{ fontSize: 13, color: "var(--fg2)" }}>{t.msg}</span>
        </span>
        {t.cta ? (
          <button
            onClick={() => {
              toast.dismiss(to.id);
              t.cta!.onClick();
            }}
            style={{
              flex: "none",
              marginLeft: "auto",
              height: 38,
              padding: "0 13px",
              border: 0,
              borderRadius: 11,
              background: "#1A73E8",
              boxShadow: "0 3px 0 #174EA6",
              color: "#fff",
              font: "700 13.5px var(--fu)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.cta.label}
          </button>
        ) : null}
        <button
          aria-label="Dismiss"
          onClick={() => toast.dismiss(to.id)}
          style={{
            marginLeft: t.cta ? 0 : "auto",
            width: 32,
            height: 32,
            border: 0,
            borderRadius: 8,
            background: "transparent",
            color: "var(--fg3)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Icon n="x" s={16} />
        </button>
      </div>
    ),
    { duration: t.ms ?? (t.error ? 6000 : 4000) },
  );
}

export const T = {
  flagCaptured: (title: string) =>
    showToast({ icon: "flag", bg: "var(--Rs)", fg: "var(--Rt)", title: "Flag captured! 🚩", msg: `${title} · sent for verification` }),
  solutionShipped: (title: string) =>
    showToast({ icon: "circle-check", bg: "var(--Gs)", fg: "var(--Gt)", title: "Solution shipped", msg: `${title} is in review` }),
  loggedOut: () =>
    showToast({ icon: "log-out", bg: "var(--s1)", fg: "var(--fg2)", title: "Logged out", msg: "See you back in the arena." }),
  error: (title: string, msg: string) =>
    showToast({ icon: "circle-alert", bg: "var(--Rs)", fg: "var(--Rt)", title, msg, error: true }),
};
