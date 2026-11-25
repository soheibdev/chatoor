/**
 * CHATOOOR — frontend-only game layer.
 * Direct port of the design's `ym-game.js`. Everything here is DERIVED from existing
 * API data (leader-board points, challenge points/difficulty/type,
 * challenge.submissions[].status). No new API fields are invented.
 */

export type TrackKey = "ps" | "ctf" | "ai";
export type DiffKey = "easy" | "medium" | "hard";
export type SubStatus = "pending" | "accepted" | "rejected";
export type QuestState = "new" | "pending" | "accepted" | "rejected" | "unknown";

export interface Submission {
  status: SubStatus;
  points?: number;
  link?: string;
  flag?: string;
  created_at?: string;
  id?: string;
}

export interface Challenge {
  id: string;
  type: TrackKey;
  difficulty: DiffKey;
  points: number;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  hints?: { cost: number; text?: string }[];
  submissions?: Submission[] | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  nick_name: string;
  points: number;
  full_name?: string;
  email?: string;
}

export interface Tier {
  key: string;
  name: string;
  min: number;
  pips: number;
}

export interface TierInfo extends Tier {
  index: number;
  next: Tier | null;
  toNext: number;
  pct: number;
}

/** Tunable tier thresholds (points). Rookie → Coder → Hacker → Legend */
export const TIERS: Tier[] = [
  { key: "rookie", name: "Rookie", min: 0, pips: 1 },
  { key: "coder", name: "Coder", min: 150, pips: 2 },
  { key: "hacker", name: "Hacker", min: 400, pips: 3 },
  { key: "legend", name: "Legend", min: 900, pips: 4 },
];

export function tierFor(p: number): TierInfo {
  let i = TIERS.length - 1;
  while (i > 0 && p < TIERS[i].min) i--;
  const t = TIERS[i];
  const n = TIERS[i + 1];
  return {
    ...t,
    index: i,
    next: n || null,
    toNext: n ? n.min - p : 0,
    pct: n ? Math.round(((p - t.min) / (n.min - t.min)) * 100) : 100,
  };
}

export const TRACK: Record<
  TrackKey,
  { label: string; short: string; icon: string; k: "B" | "R" | "G"; field: "link" | "flag" }
> = {
  ps: { label: "Problem Solving", short: "PS", icon: "code-xml", k: "B", field: "link" },
  ctf: { label: "Cybersecurity", short: "CTF", icon: "shield", k: "R", field: "flag" },
  ai: { label: "AI / ML", short: "AI", icon: "brain", k: "G", field: "link" },
};

export const DIFF: Record<DiffKey, { label: string; n: number }> = {
  easy: { label: "Easy", n: 1 },
  medium: { label: "Medium", n: 2 },
  hard: { label: "Hard", n: 3 },
};

/** accepted > pending > rejected > new. 'unknown' when submissions isn't returned (e.g. CTF). */
export function stateOf(subs: Submission[] | null | undefined): QuestState {
  if (!Array.isArray(subs)) return "unknown";
  if (!subs.length) return "new";
  if (subs.some((s) => s.status === "accepted")) return "accepted";
  if (subs.some((s) => s.status === "pending")) return "pending";
  return "rejected";
}

const KEYS = ["B", "R", "Y", "G"] as const;
export type HueKey = (typeof KEYS)[number];

export function hue(s: string): HueKey {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return KEYS[h % 4];
}

export function initials(s: string): string {
  const w = String(s)
    .replace(/[^a-zA-Z0-9 ._-]/g, "")
    .split(/[ ._-]+/)
    .filter(Boolean);
  if (!w.length) return "?";
  if (w.length > 1) return (w[0][0] + w[1][0]).toUpperCase();
  const cap = w[0].slice(1).match(/[A-Z]/);
  return (w[0][0] + (cap ? cap[0] : w[0][1] || "")).toUpperCase();
}

export function rank(players: Player[], id: string) {
  const sorted = [...players].sort((a, b) => b.points - a.points);
  const i = sorted.findIndex((p) => p.id === id);
  const me = sorted[i] || { id, nick_name: "", points: 0 };
  const above = i > 0 ? sorted[i - 1] : null;
  return {
    rank: i + 1,
    me,
    above,
    gap: above ? above.points - me.points + 1 : 0,
    sorted,
  };
}

/** `m ago` / `h ago` / `d ago` */
export function rel(iso: string, now: number = Date.now()): string {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (!isFinite(m)) return "";
  if (m < 60) return m + "m ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  return Math.round(h / 24) + "d ago";
}

/** Consecutive days of submissions ending today or yesterday. 0 when there are no timestamps. */
export function streakOf(challenges: Challenge[]): number {
  const days = new Set<string>();
  let any = false;
  for (const c of challenges) {
    for (const s of c.submissions || []) {
      if (!s.created_at || s.created_at === "just") continue;
      const t = Date.parse(s.created_at);
      if (!isFinite(t)) continue;
      any = true;
      days.add(new Date(t).toISOString().slice(0, 10));
    }
  }
  if (!any) return 0;
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();
  const start = days.has(key(today))
    ? today
    : (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return days.has(key(y)) ? y : null;
      })();
  if (!start) return 0;
  let n = 0;
  const cur = new Date(start);
  while (days.has(key(cur))) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

/** Track submit fills, as specified in the design system. */
export const TRACK_FILL: Record<TrackKey, [string, string]> = {
  ps: ["#1A73E8", "#174EA6"],
  ctf: ["#D93025", "#A50E0E"],
  ai: ["#188038", "#0D652D"],
};

/** Flag / link validation, ported verbatim from the prototype's `validate()`. */
export function validate(type: TrackKey, raw: string): { ok: boolean; empty?: boolean; msg?: string; host?: string | null } {
  const v = raw.trim();
  if (!v) return { ok: false, empty: true };
  if (type === "ctf") {
    const ok = /^gdgbatna\{[^\s{}]+\}$/.test(v);
    return {
      ok,
      msg: ok
        ? "Format looks right. Flags are case-sensitive."
        : !v.startsWith("gdgbatna{")
          ? "Flags start with gdgbatna{"
          : !v.endsWith("}")
            ? "Almost: close it with }"
            : "No spaces or extra braces inside the flag.",
    };
  }
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return { ok: false, msg: "Paste a full URL starting with https://" };
  }
  const host = u.hostname.replace(/^www\./, "");
  const label =
    host === "github.com" ? "GitHub repo" : host === "colab.research.google.com" ? "Colab notebook" : null;
  return {
    ok: true,
    host: label,
    msg: label ? "Looks good. Make sure it’s public." : "Link accepted. GitHub or Colab works best for reviewers.",
  };
}

export const SEEN_WINS = "ym:seenWins";
export const LAST_RANK = "ym:lastRank";
