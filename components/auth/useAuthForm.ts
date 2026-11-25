"use client";

import { useCallback, useMemo, useState } from "react";
import { hue, initials } from "@/lib/game";

export type FieldKey = "full" | "nick" | "email" | "pw";

export interface ServerErr {
  t: string;
  m: string;
}

/** Validation, messages and ordering ported verbatim from the prototype's authErrs(). */
export function useAuthForm(mode: "login" | "register") {
  const reg = mode === "register";
  const [full, setFull] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, 1>>>({});
  const [focus, setFocus] = useState<string | null>(null);
  const [err, setErr] = useState<ServerErr | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const [shake, setShake] = useState(0);
  const [taken, setTaken] = useState<string | null>(null);

  const value: Record<FieldKey, string> = { full, nick, email, pw };
  const set: Record<FieldKey, (v: string) => void> = { full: setFull, nick: setNick, email: setEmail, pw: setPw };

  const errs = useMemo(() => {
    const e: Partial<Record<FieldKey, string | null>> = {};
    const em = email.trim();
    e.email = !em ? "Enter your email." : !/\S+@\S+\.\S+/.test(em) ? "That email is missing its ending, like .com" : null;
    e.pw = !pw
      ? "Enter your password."
      : pw.length < 8
        ? `At least 8 characters. ${8 - pw.length} more to go.`
        : reg && !/[A-Z]/.test(pw)
          ? "Include at least one uppercase letter."
          : reg && !/[a-z]/.test(pw)
            ? "Include at least one lowercase letter."
            : reg && !/((?=.*\d)|(?=.*\W+))/.test(pw)
              ? "Include at least one number or special character."
              : null;
    if (reg) {
      e.full = !full.trim() ? "Tell us your name. Only organizers see it." : null;
      const n = nick.trim();
      e.nick = !n
        ? "Pick a nickname for the leaderboard."
        : !/^[a-zA-Z0-9._-]{3,20}$/.test(n)
          ? "Use 3–20 letters, numbers, dots, dashes or underscores."
          : taken && n.toLowerCase() === taken.toLowerCase()
            ? "Already taken. Try another handle."
            : null;
    }
    return e;
  }, [email, pw, full, nick, reg, taken]);

  const order: FieldKey[] = reg ? ["full", "nick", "email", "pw"] : ["email", "pw"];
  const firstInvalid = order.find((k) => errs[k]);

  const markAllTouched = useCallback(() => setTouched({ full: 1, nick: 1, email: 1, pw: 1 }), []);
  const bump = useCallback(() => setShake((s) => s + 1), []);

  const pfx = reg ? "rg-" : "lg-";

  const strength = useMemo(() => {
    if (!reg || !pw) return null;
    const sc = [
      pw.length >= 8,
      /[a-z]/.test(pw) && /[A-Z]/.test(pw),
      /\d/.test(pw),
      /[^A-Za-z0-9]/.test(pw) || pw.length >= 12,
    ].filter(Boolean).length;
    const cols = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];
    return {
      segs: cols.map((c, i) => ({ c: i < sc ? c : "var(--ln)" })),
      label: pw.length < 8 ? `${8 - pw.length} more to go` : ["", "Good to go", "Strong", "Strong", "Super strong"][sc],
      color: pw.length < 8 ? "var(--fg3)" : "var(--Gt)",
    };
  }, [pw, reg]);

  const previewNick = nick.trim() || "your_nickname";
  const hk = hue(previewNick);

  return {
    reg,
    pfx,
    value,
    set,
    show,
    setShow,
    touched,
    setTouched,
    focus,
    setFocus,
    errs,
    order,
    firstInvalid,
    markAllTouched,
    bump,
    shake,
    phase,
    setPhase,
    err,
    setErr,
    taken,
    setTaken,
    strength,
    preview: {
      nick: previewNick,
      ini: initials(previewNick),
      bg: `var(--${hk}s)`,
      fg: `var(--${hk}t)`,
    },
    busy: phase === "loading",
  };
}

export const PERKS_IN: [string, string, string][] = [
  ["save", "Save your progress", "B"],
  ["swords", "Jump into weekly challenges", "R"],
  ["trophy", "Climb the leaderboard", "Y"],
  ["book-open", "Access curated resources", "G"],
];

export const PERKS_UP: [string, string, string][] = [
  ["sprout", "Start as a Rookie, 0 pts", "G"],
  ["zap", "Earn points on every accepted solve", "Y"],
  ["trophy", "Get your name on the live board", "B"],
  ["crown", "Reach Legend at 900 pts", "Y"],
];
