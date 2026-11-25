/**
 * Review fallback content.
 *
 * The app talks to the real API (lib/api.ts). This file exists only so the UI can be
 * reviewed against the design when `https://apidevchallenge.gdgbatna.com/` is not
 * reachable from the reviewer's machine — it is the same sample content the design
 * prototype shipped in `ym-game.js`. Nothing here is read while the API answers, and
 * `NEXT_PUBLIC_DEMO=0` disables it entirely.
 */
import type { Challenge, Player } from "./game";
import type { AdminSubmission, Participant } from "./api";

export const DEMO_FALLBACK = process.env.NEXT_PUBLIC_DEMO !== "0";

/**
 * True when a request failed in a way that means "this reviewer has no usable session"
 * rather than "the server said no to valid input": no response at all, or 401/403.
 * Set NEXT_PUBLIC_DEMO=0 to switch the fallback off and get strict API behaviour.
 */
export function shouldFallback(err: unknown): boolean {
  if (!DEMO_FALLBACK) return false;
  const e = err as { response?: { status?: number } };
  if (!e?.response) return true;
  const s = e.response.status;
  return s === 401 || s === 403;
}

export const sampleChallenges: Challenge[] = [
  {
    id: "c1", type: "ps", difficulty: "easy", points: 50, title: "Bracket Balancer", subtitle: "stacks · strings",
    description: "Given a string of brackets, decide if every opener is closed in the right order. Then do it in one pass.",
    link: "#", hints: [{ cost: 10 }],
    submissions: [{ status: "accepted", points: 50, link: "https://github.com/yacine-dev/bracket-balancer", created_at: "2026-11-08T18:20:00Z" }],
  },
  {
    id: "c2", type: "ps", difficulty: "medium", points: 100, title: "Matrix Spiral", subtitle: "arrays · simulation",
    description: "Walk an N×M matrix in spiral order without extra memory. Edge cases decide the winners.",
    link: "#", hints: [{ cost: 15 }, { cost: 25 }],
    submissions: [
      { status: "rejected", points: 0, link: "https://github.com/yacine-dev/spiral", created_at: "2026-11-10T21:02:00Z" },
      { status: "pending", points: 0, link: "https://github.com/yacine-dev/spiral-v2", created_at: "2026-11-12T09:45:00Z" },
    ],
  },
  {
    id: "c3", type: "ps", difficulty: "hard", points: 200, title: "Shortest Path to Batna", subtitle: "graphs · dijkstra",
    description: "Road network, weighted edges, one roadblock that moves every hour. Find the fastest route home.",
    link: "#", hints: [], submissions: [],
  },
  {
    id: "c4", type: "ctf", difficulty: "easy", points: 100, title: "Cookie Monster", subtitle: "web · sessions",
    description: "The admin panel trusts a cookie a little too much. Convince it you belong there.",
    link: "#", hints: [{ cost: 20 }],
    submissions: [{ status: "accepted", points: 100, created_at: "2026-11-09T14:10:00Z" }],
  },
  {
    id: "c5", type: "ctf", difficulty: "medium", points: 150, title: "Hidden in Plain Sight", subtitle: "forensics · stego",
    description: "A club photo from last year’s DevFest is hiding more than smiles. Extract the flag.",
    link: "#", hints: [{ cost: 25 }, { cost: 40 }],
    submissions: [{ status: "rejected", points: 0, created_at: "2026-11-11T22:30:00Z" }],
  },
  {
    id: "c6", type: "ctf", difficulty: "hard", points: 250, title: "Broken Auth", subtitle: "web · jwt",
    description: "Tokens are signed. Mostly. Find the weak link in the login flow and read the vault.",
    link: "#", hints: [{ cost: 50 }],
  },
  {
    id: "c7", type: "ai", difficulty: "easy", points: 75, title: "Digit Whisperer", subtitle: "vision · classification",
    description: "Train a classifier on handwritten digits and push validation accuracy past 98%.",
    link: "#", hints: [], submissions: [],
  },
  {
    id: "c8", type: "ai", difficulty: "medium", points: 150, title: "Sentiment of the Souk", subtitle: "nlp · arabic",
    description: "Classify Algerian-Arabic market reviews as positive, neutral or negative. Darija welcome.",
    link: "#", hints: [{ cost: 30 }], submissions: [],
  },
  {
    id: "c9", type: "ai", difficulty: "hard", points: 250, title: "Date Palm Doctor", subtitle: "vision · detection",
    description: "Detect and localise disease spots on date palm leaves from field photos.",
    link: "#", hints: [{ cost: 40 }], submissions: [],
  },
];

export const samplePlayers: Player[] = [
  { id: "u1", nick_name: "0xAmine", points: 1240 },
  { id: "u2", nick_name: "meriem.sec", points: 1105 },
  { id: "u3", nick_name: "lina_ml", points: 980 },
  { id: "u4", nick_name: "rayan404", points: 860 },
  { id: "u5", nick_name: "walid_dz", points: 790 },
  { id: "u6", nick_name: "kenza.codes", points: 720 },
  { id: "u7", nick_name: "sofiane", points: 655 },
  { id: "u8", nick_name: "hakim_bytes", points: 590 },
  { id: "u9", nick_name: "nour.ai", points: 520 },
  { id: "u10", nick_name: "bilal.rs", points: 455 },
  { id: "u11", nick_name: "ines.py", points: 365 },
  { id: "me", nick_name: "yacine_dev", points: 340 },
  { id: "u13", nick_name: "aya_stack", points: 310 },
  { id: "u14", nick_name: "mohamed.k", points: 260 },
  { id: "u15", nick_name: "sara_null", points: 205 },
  { id: "u16", nick_name: "adam.git", points: 150 },
  { id: "u17", nick_name: "zineb", points: 95 },
  { id: "u18", nick_name: "khaled_0", points: 40 },
];

const FULL: Record<string, string> = {
  "0xAmine": "Amine Belkacem", "meriem.sec": "Meriem Haddad", lina_ml: "Lina Zerrouki",
  rayan404: "Rayan Mebarki", walid_dz: "Walid Boudiaf", "kenza.codes": "Kenza Amrani",
  sofiane: "Sofiane Lounis", hakim_bytes: "Hakim Ferhat", "nour.ai": "Nour Benkhelifa",
  "bilal.rs": "Bilal Rahmani", "ines.py": "Ines Saadi", yacine_dev: "Yacine Benali",
  aya_stack: "Aya Chenouf", "mohamed.k": "Mohamed Khelifi", sara_null: "Sara Nouali",
  "adam.git": "Adam Guediri", zineb: "Zineb Tlemcani", khaled_0: "Khaled Ouali",
};

export const sampleParticipants: Participant[] = samplePlayers.map((p) => ({
  id: p.id,
  points: p.points,
  nick_name: p.nick_name,
  email: `${p.nick_name.replace(/[^a-z0-9]/gi, ".").toLowerCase()}@gdgbatna.com`,
  full_name: FULL[p.nick_name] || p.nick_name,
}));

const byNick = (n: string) => sampleParticipants.find((p) => p.nick_name === n)!;

export const sampleAdminSubmissions: AdminSubmission[] = [
  { id: "s1", challengeID: "c2", status: "pending", points: 0, link: "https://github.com/yacine-dev/spiral-v2", created_at: "2026-11-13T11:45:00Z", user: byNick("yacine_dev"), challenge: sampleChallenges[1] },
  { id: "s2", challengeID: "c5", status: "pending", points: 0, flag: "gdgbatna{st3g0_1s_fun}", created_at: "2026-11-13T10:20:00Z", user: byNick("meriem.sec"), challenge: sampleChallenges[4] },
  { id: "s3", challengeID: "c8", status: "pending", points: 0, link: "https://colab.research.google.com/drive/1aB2c", created_at: "2026-11-13T08:05:00Z", user: byNick("lina_ml"), challenge: sampleChallenges[7] },
  { id: "s4", challengeID: "c1", status: "accepted", points: 50, link: "https://github.com/amine/bracket", created_at: "2026-11-12T19:30:00Z", user: byNick("0xAmine"), challenge: sampleChallenges[0] },
  { id: "s5", challengeID: "c4", status: "accepted", points: 100, flag: "gdgbatna{c00k13_m0nst3r}", created_at: "2026-11-12T16:10:00Z", user: byNick("rayan404"), challenge: sampleChallenges[3] },
  { id: "s6", challengeID: "c3", status: "rejected", points: 0, link: "https://github.com/walid/dijkstra", created_at: "2026-11-12T09:00:00Z", user: byNick("walid_dz"), challenge: sampleChallenges[2] },
  { id: "s7", challengeID: "c6", status: "rejected", points: 0, flag: "gdgbatna{wrong_one}", created_at: "2026-11-11T21:40:00Z", user: byNick("hakim_bytes"), challenge: sampleChallenges[5] },
  { id: "s8", challengeID: "c7", status: "accepted", points: 75, link: "https://colab.research.google.com/drive/9zY8x", created_at: "2026-11-11T14:25:00Z", user: byNick("nour.ai"), challenge: sampleChallenges[6] },
];
