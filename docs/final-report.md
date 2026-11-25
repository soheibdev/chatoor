# Final report

## What was built

A complete presentation-layer rebuild of CHATOOOOOOR from `design_handoff_chatoooooor/`, as a Next.js 16 / React
19 / TypeScript / Tailwind v4 app in `chatoooooor/`.

**Screens** — landing (hero, Makers, tracks, features, why, quest banner, footer), register slide-over and bottom
sheet, `/login`, `/register`, `/challenges` with the submission modal and Conquered overlay, `/leaderboard`,
`/resources`, `/community`, the admin shell with Participants and Submissions (view modal, edit-points modal,
review drawer, edit-submission modal), `404`, and the system states (skeletons, splash, empty, network error,
401 dialog, toasts).

**Method** — every style in the design files is inline, so values were read from the source and ported rather
than re-derived. `lib/game.ts` is a direct port of `ym-game.js` (tier thresholds, track map, `stateOf`,
rank/gap, avatar hue and initials, relative time, flag/link validation), with the mock data dropped.
`components/landing/Makers.tsx` is a 1:1 port of `YmMakers.dc.html`, including the 34ms/char type-on with
170ms line pauses, the five-copy glitch, the brush-stroke draw, the 160ms/220ms hover dwell, the 450ms panel
with 60ms item stagger, the character-select vignettes and floating player cards, the trophy sparks and tooltip,
the cursor-tracked scanner light over the hidden flag, the rAF-throttled parallax, and the mobile carousel.
Icons map `ym-icon n="kebab"` to the matching `lucide-react` component.

Precedence was applied as instructed: **Prototype > Makers > Screens 1–6 > Design System**.

## Verification

- 51 reference screens captured from the design boards (`docs/design-reference/`), 34 from this build
  (`docs/build-shots/`), at 1440×900 and 390×844 plus interactive states.
- `scripts/computed-check.mjs` compares computed styles against the live design. **Every measured property
  matches** — font size, weight, line-height, tracking, colours, radius, padding, height, shadow and element size.
- Chrome geometry measured against the design directly: desktop navbar 69px, mobile header 61px, tab bar 87px —
  identical on both sides.
- `npm run build` passes; `tsc --noEmit` is clean.

A numeric pixelmatch between the two sets would not be meaningful: the design boards are static mock-ups
(212 players, 48,320 points, "27 days" to kick-off) while the build renders live data and a live countdown, so a
diff would be dominated by content, not design. Structure and computed styles were compared instead.

### One fix worth naming

Reduced motion originally neutralised `animation-duration` but not `animation-delay`, so staggered items
(the podium's 0/90/180ms entrance) stayed at opacity 0 under `prefers-reduced-motion`. `animation-delay` and
`transition-delay` are now zeroed in that media query, which is also what §10 asks for ("roll-ups → final value").

### Box model

The design does **not** apply a global `border-box` reset — it is content-box by default, with
`box-sizing:border-box` set inline where needed. Tailwind's preflight does apply one globally, which silently
shrank every bordered fixed-height element (the tab bar measured 70px against the design's 87px). The reset is
turned back off in `globals.css`, after which all three chrome heights match exactly.

## Where the design disagrees with itself

Each of these was implemented **as designed** rather than resolved unilaterally. Full list with measurements in
`docs/fidelity-checklist.md`.

1. **Horizontal overflow between 760px and ~1200px.** §11 requires no horizontal scroll from 320 to 1920, but the
   design's desktop navbar is a non-wrapping flex row with a 1200px intrinsic width and is used from 760px up.
   Measured on the design: 760px → +440px, 1024px → +176px, 1200px → 0. This build reproduces those numbers
   exactly. The mobile header likewise overflows below ~378px (design +26px at 320, build +21px). Fixing it means
   changing the navbar layout — a redesign, so it is reported rather than done.
2. Leaderboard list includes the top 3 (prototype) vs starting at #4 (LB1).
3. Leaderboard aside has only "YOUR POSITION" (prototype) vs three cards (LB1).
4. Challenges header line, rings box contents, "Difficulty" label and `/` key chip differ between the prototype
   and C1.
5. Submission modal footer: payload hint (prototype) vs "Esc to close" (M1).
6. Submission history heading: "Submission history" (prototype) vs "Attempts" (M1).
7. Footer: no ACCOUNT column (prototype) vs one for guests (L1).
8. Mobile guest nav: "Join" + icon button (prototype) vs a full-height guest sheet (N1).

## Deliberate deviations

- **Prototype scaffolding removed**, as instructed: the Demo controls panel, the dashed "Prototype: any email
  works…" hints, and the "Outside this prototype" toasts.
- **Route protection is client-side** (`RequireAuth` + `callbackUrl`), not the original `middleware.ts` cookie
  check. The designed gate — the `--Bs` banner reading "Log in to open {Challenges|the Leaderboard}. You'll land
  right there after." — only exists if the app reaches React, and an edge redirect would skip it. If you want the
  edge guard back as well, it can sit in front of this without changing the UI.
- **Review fallback.** The deployed API returns `401` to an unauthenticated client, so without it every screen is
  a redirect to `/login`. A failure that means "no usable session" (no response, or 401/403) falls back to the
  sample content from `ym-game.js`. `NEXT_PUBLIC_DEMO=0` disables it entirely.
- **Hint text** is rendered from the design's per-track copy when the API supplies a hint with a cost but no text
  (see the open question below).

## Open backend questions

These are the four the brief asks for, plus one found while building.

1. **Hint unlocking has no endpoint.** The UI is complete — locked rows with the striped placeholder, the
   "Unlock · −N pts" button, the inline "Spend N pts on this hint?" confirm, and the unlocked row with
   "−N pts used" — but unlocking is client-state only. Nothing is persisted and no points are deducted
   server-side. An endpoint is needed (something like `POST /hints/unlock { challengeID, hintIndex }` returning
   the hint text and the new point total). Related: `challenge.hints[]` carries a `cost` but no text, so the
   unlocked copy currently comes from the design's per-track strings in `SubmissionModal.tsx`.
2. **Do `challenge.submissions[]` items carry `created_at`, `link`/`flag` and `points`?** The history timeline,
   the relative timestamps, the "— pts while pending" column and the streak chip all read them. The code degrades
   safely — the streak hides entirely when no timestamps exist — but the designed states need these fields.
3. **Do CTF challenges return `submissions` at all?** `stateOf` treats a non-array as `unknown`, which renders
   exactly like `new` and hides history, as specified. Confirming this would let the CTF card show real state
   instead of always offering "Hack it".
4. **Does `GET /submissions` (admin) return the submitted flag?** The review drawer shows the flag in large mono
   with Copy. If the field is withheld, the drawer needs a different affordance for CTF review.
5. **Does `GET /submissions` embed the user and challenge?** The admin table needs the submitter's nickname and
   the challenge's title, subtitle, type, difficulty and max points per row. If the endpoint returns only IDs,
   either it should embed them or the page needs a documented join against `/participants` and `/challenges`.

## Not yet covered

- Screens 6 N1 (guest sheet) and N2 (mobile player sheet) are not built, because the prototype defines those
  entry points differently and takes precedence — see conflicts 8 above.
- The Makers people-cutout layer is supported as an optional `cutout` prop on its own parallax layer, but no
  cutout PNG was supplied, so nothing renders on that layer.
- The quest banner keeps the striped dashed mascot placeholder, as instructed, until art is supplied.
