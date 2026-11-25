/**
 * Captures every labelled screen from the design boards as its own PNG.
 * Each board marks its screens with data-screen-label and renders them at their real size,
 * so these are exact references to diff the build against.
 *
 *   npx serve -l 4173 design_handoff_chatoooooor/design
 *   node scripts/design-shots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:4173";
const OUT = "docs/design-reference";

const BOARDS = [
  "Makers Section.dc.html",
  "Screens 1 - Landing and Auth.dc.html",
  "Screens 2 - Challenges and Submission.dc.html",
  "Screens 3 - Leaderboard.dc.html",
  "Screens 4 - Resources and Community.dc.html",
  "Screens 5 - Admin.dc.html",
  "Screens 6 - States and System.dc.html",
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const board of BOARDS) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${encodeURIComponent(board)}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(6000); // boards render many components + fetch lucide icons

  const nodes = await page.$$("[data-screen-label]");
  console.log(board, "→", nodes.length, "screens");
  for (const n of nodes) {
    const label = await n.getAttribute("data-screen-label");
    const file = path.join(OUT, `${slug(label)}.png`);
    try {
      await n.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await n.screenshot({ path: file });
      console.log("  saved", file);
    } catch (e) {
      console.log("  skipped", label, e.message.split("\n")[0]);
    }
  }
  await ctx.close();
}

await browser.close();
