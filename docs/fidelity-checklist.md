# Fidelity checklist

Build: `chatoooooor` (Next.js 16 · React 19 · TS · Tailwind v4)
Design: `design_handoff_chatoooooor/design` served at `:4173`
References: `docs/design-reference/` (40 board screens + 11 Makers states, captured with Playwright)
Build shots: `docs/build-shots/` (10 screens × 2 viewports + 14 interactive states)

Precedence applied throughout: **Prototype.dc.html > Makers Section / YmMakers > Screens 1–6 > Design System**.
Where a Screens board disagrees with the prototype, the prototype was followed and the difference is listed in
[§ Known design conflicts](#known-design-conflicts).

| Screen / state | Viewports checked | Result |
|---|---|---|
| Landing · hero | 1440, 1024, 768, 390, 360 | ✅ pill + pulsing dot, 3-line H1 with B/R/G inks, `clamp(56px,7vw,88px)`, CTAs h56, 50+/200+/Free stats |
| Landing · season card | 1440, 390 | ✅ r24, four-colour 8px bar, live kick-off countdown, Online chip |
| Landing · tier ladder | 1440, 390 | ✅ 2px connector, 48px tiles, Legend gold frame + glow, current tier blue ring |
| Landing · Makers (closed) | 1440, 390 | ✅ badge, yellow `<choose_your_challenger/>`, 4-line headline, gradient "YOUR TURN.", brush stroke, hint pill |
| Makers · type-on + glitch + draw | 1440 | ✅ 34ms/char, 170ms line pauses, 5-copy glitch at 90ms, brush `ymDraw` 420ms |
| Makers · panel open (D2) | 1440 | ✅ photo `translateX(-28%)`, dim layer, headline out −40px, glass panel 450ms, 60ms item stagger |
| Makers · character select P1/P2 (D3/D4) | 1440 | ✅ vignette + screen-blended rim, floating card w290 with `scaleX` stat bars |
| Makers · trophy tooltip (D5) | 1440 | ✅ hotspot 93.4%/54%, gold ring, 6 sparks, tooltip with 1/2/3 metal chips |
| Makers · easter egg (D6) | 1440 | ✅ blurred code, scanner light follows cursor via `--sx/--sy`, flag button → 6.5s toast with Sign up |
| Makers · mobile (M1–M3) | 390 | ✅ 4:3 frame, cropped layer 133.1%, tap chip with nudging chevrons, snap carousel, "1 / 2" counter |
| Register slide-over (L3) | 1440 | ✅ 500px panel, 4px stripe, live player-card preview, strength bar, "Start my coding journey" |
| Register sheet + success (L4) | 390 | ✅ bottom sheet, grab handle, confetti dots, `ymFill` 1500ms bar, redirect |
| Login (A1/A3) | 1440, 390 | ✅ two-column 1160/56, H1 56/60, 4 perk rows, card r28 + stripe, mobile drops card chrome |
| Register page (A2/A4) | 1440, 390 | ✅ preview, ADMIN ONLY / PUBLIC badges, B/R/Y/G strength segments |
| Auth validation | — | ✅ blur-then-live, verbatim messages, first invalid focused, card shake `ymShakeA/B` |
| Auth server errors | — | ✅ `role="alert"` banner takes focus, card shakes, 409 flags the nickname and reads "conflict" |
| Challenges · header + rings | 1440, 390 | ✅ `<challenges/>`, 44/28px title, motivation line, conic rings 52/40, streak chip only with timestamps |
| Challenges · filter bar | 1440, 390 | ✅ h46 search (`/` focuses, 250ms debounce), segmented track tabs with counts, grid/list toggle, difficulty pills |
| QuestCard grid · 5 states | 1440 | ✅ new/Hack it, In review, Retry, Conquered seal + "+X earned", unknown renders as new |
| QuestCard list | 1440 | ✅ `40px minmax(0,1fr) 130px 120px 140px`, gap 18 |
| Submission modal · CTF (M1/M5) | 1440, 390 | ✅ track chip, format strip + Copy format → "Copied!" 2s, h56 r14 2px input, live flag messages |
| Submission modal · PS/AI (M2) | 1440 | ✅ link field, GitHub/Colab host chips, history timeline with 24px status dots |
| Submit success (M3) | 1440 | ✅ 112px r34 tile rotated −6°, `ymPop`, four dots, 38px title, auto-close 1500ms |
| Conquered overlay (M4) | 1440 | ✅ gold border + `0 0 0 6px --Ys`, 92px check, +X pts pill, rank struck-through → new, tier bar, 44-piece confetti |
| Leaderboard · podium | 1440, 390 | ✅ 2-1-3 order, metals, 80/100/74 avatars, 130/180/100 blocks, `ymIn` 0/90/180ms |
| Leaderboard · podium < 400px (LB3) | container query | ✅ champion card + two half cards |
| Leaderboard · rows | 1440, 390 | ✅ h62, `56px 44px minmax(0,1fr) auto 90px`, metal/conic/solid avatar rings, TOP 10 chip, YOU row ring |
| Leaderboard · your position | 1440 | ✅ `--B` border + 4px `--Bs`, #rank 56px, gap bar, pending projection, Find a quest |
| Leaderboard · pinned you bar (LB2) | 1440, 390 | ✅ IntersectionObserver, aligned to the list column, above the tab bar on mobile |
| Resources (R1) | 1440, 390 | ✅ stats strip, language radios, category pills with track colours, cards with level/AR chips, tags, rating, FREE |
| Resources · Arabic RTL (R2) | 1440, 390 | ✅ `dir="rtl" lang="ar"`, IBM Plex Sans Arabic, +1px size, lh 1.6, Arabic labels inside the English UI |
| Resources · empty state | — | ✅ "Nothing on the shelf for that" + Clear filters |
| Community (CM1/CM2) | 1440, 390 | ✅ white logo tile 140×196 / 96×134 (no overflow or wrap at 360–1440), Discord card with bracket motif |
| Admin shell (P1) | 1440, 768 | ✅ 248/68px sidebar (`W`), real `useAuth()` admin, ROLE · ADMIN menu, no bell, no mock delete |
| Admin participants (P1) | 1440, 390 | ✅ 4 stat tiles, `72px 1.5fr 110px 120px 1.4fr 92px`, h40 head / h52 rows, pagination, cards < 768px |
| Admin view participant (P2) | 1440 | ✅ w460, avatar 56, points/rank·tier tiles, email + user ID with copy |
| Admin edit points (P3) | 1440 | ✅ 64px −10/+10 around a 60px value box, "Was N · ±N · Tier → Tier", sends `{ userID, points }` |
| Admin submissions (S1) | 1440, 390 | ✅ underline tabs with counts, track segmented filter, `1fr 1.4fr 1.5fr 120 118 84 84`, h58, pending first |
| Admin review drawer (S1) | 1440 | ✅ w520, ‹ › walk, status radios (accepted prefills max / rejected 0), Full points, Save · accept +N |
| Admin edit submission (S2) | 1440 | ✅ w500, status radios, stepper with range hint, link + Test link |
| Admin optimistic flip | — | ✅ status flips immediately, 1.2s row sweep, revert + error toast on failure, row spinner |
| 404 (404a/404b) | 1440, 390 | ✅ bracket motif + 180/96px "404", copy verbatim, both CTAs, requested path in mono |
| Skeletons (ST1/ST3) | 1440 | ✅ shimmer `--s2 → --ln`, 600px band, 1.4s, first load only |
| Splash (ST2) | — | ✅ 80px white mark tile, four hopping dots 120ms stagger, "Loading the arena…" |
| Network error (X1) | 1440 | ✅ WifiOff tile, Try again + Ask on Discord, mono `GET /challenges` line |
| 401 session ended (X2) | — | ✅ alert dialog, returns to the same page through `callbackUrl` |
| Toasts (X3) | 1440, 390 | ✅ `toast.custom`, r16 `--s2`, 36px tile, top-center 84px / bottom-center 84px, 4s (6s errors) |
| Light mode (LM1/LM2) | 1440, 390 | ✅ `[data-theme="light"]` tokens, persisted, no-flash boot script |
| Tab bar | 390 | ✅ 5 columns, 87px total (70 + 6/10 padding + 1px border — matches the design's content-box) |
| Reduced motion | — | ✅ confetti off, stagger delays zeroed, pulses stop, slides become fades |
| Keyboard | — | ✅ `/` search, Esc, Enter/Space on cards, arrow keys on tabs, focus traps return focus, `W`/`F` ignored while typing |
| RTL (`dir="rtl"`) | 1440 | ✅ logical properties throughout, directional icons flip, code eyebrows pinned LTR |
| Horizontal overflow | 320–1920 | ⚠️ matches the design exactly — see conflict 1 below |

## Programmatic style comparison (§14.4)

`node scripts/computed-check.mjs` compares computed styles of the navbar, hero H1, primary CTA and season card
between the design and the build at 1440×900. Current result: **every measured property is identical** —
`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `color`, `backgroundColor`, `borderRadius`, `padding`,
`height`, `boxShadow` and element size.

The only reported difference is the `font-family` *string*: `next/font` inserts a metric-matched fallback
(`Unbounded, "Unbounded Fallback", Outfit`) where the design writes `Unbounded, Outfit`. The face that actually
renders is the same, and the measured sizes match, so this is a declaration difference, not a visual one.

Chrome geometry verified against the design directly:

| Element | Design | Build |
|---|---|---|
| Desktop navbar | 69px (68 + 1px border) | 69px |
| Mobile header | 61px | 61px |
| Mobile tab bar | 87px | 87px |

## Known design conflicts

These are places where the design disagrees with itself or with the written spec. Each was implemented **as
designed** (prototype first), not resolved unilaterally.

1. **Horizontal overflow between 760px and ~1200px.** §11 says "No horizontal page scroll at any width from 320
   to 1920", but the design's own desktop navbar is a non-wrapping flex row with a 1200px intrinsic width, and it
   is used from 760px up. Measured on the design prototype: 760px → +440px, 1024px → +176px, 1200px → 0.
   This build reproduces those numbers exactly (760 → +440, 1024 → +176, 1200 → 0). The mobile header likewise
   overflows below ~378px (design 320px → +26px, build → +21px). Fixing it means changing the navbar's layout,
   which would be a redesign.
2. **Leaderboard list includes the top 3.** The prototype lists every player from #1; Screens 3 LB1 starts the
   list at #4 because the podium already shows the top 3. Prototype followed.
3. **Leaderboard side panel.** The prototype's aside holds only "YOUR POSITION"; LB1 adds "Rank colour guide" and
   "Tiers" cards. Prototype followed.
4. **Challenges header.** The prototype's line is "You're #12. Next rank in 26 pts." and the rings box holds three
   rings; Screens 2 C1 shows "Pick a quest. Every accepted solve moves you up.", a fourth CONQUERED tile, a
   "Difficulty" label and a `/` key chip in the search field. Prototype followed.
5. **Submission modal footer.** The prototype shows the mono payload hint (`Sends { challengeID, flag }`);
   M1 shows "Esc to close". Prototype followed (Esc still closes).
6. **Submission history heading.** Prototype: "Submission history · N". M1: "Attempts · N". Prototype followed.
7. **Footer columns.** The prototype's footer is logo + PLATFORM + FIND US; Screens 1 L1 adds an ACCOUNT column
   (Join the arena / Log in) for guests. Prototype followed.
8. **Mobile guest menu.** The prototype's mobile guest header is "Join" + a log-in icon button; Screens 6 N1 shows
   a full-height guest sheet with 60px rows and member locks. Prototype followed.
