/**
 * Verification harness (§14).
 *   node scripts/shots.mjs design   → reference shots from the design server (:4173)
 *   node scripts/shots.mjs build    → shots of this build (:3000)
 *   node scripts/shots.mjs diff     → pixelmatch build vs design, prints % differing
 *
 * Both sides run at the same viewports, with fonts loaded and animations finished.
 */
import { chromium } from "playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import pixelmatch from "pixelmatch";

const MODE = process.argv[2] || "build";
const OUT = {
  design: "docs/design-reference",
  build: "docs/build-shots",
};
const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "390x844", width: 390, height: 844 },
];

/** Screens of this build. Protected pages get a seeded local review session first. */
const BUILD_PAGES = [
  { id: "landing", url: "/" },
  { id: "login", url: "/login" },
  { id: "register", url: "/register" },
  { id: "resources", url: "/resources" },
  { id: "community", url: "/community" },
  { id: "challenges", url: "/challenges", auth: true },
  { id: "leaderboard", url: "/leaderboard", auth: true },
  { id: "admin-users", url: "/dashboard/users", auth: true },
  { id: "admin-submissions", url: "/dashboard/submissions", auth: true },
  { id: "404", url: "/this-page-never-spawned" },
];

/** The prototype is a single document; each board is reached by clicking. */
const DESIGN_PAGES = [{ id: "prototype", url: "/Prototype.dc.html" }];

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(900);
}

async function shoot(base, pages, outDir) {
  const browser = await chromium.launch();
  await mkdir(outDir, { recursive: true });
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    for (const p of pages) {
      const page = await ctx.newPage();
      if (p.auth) {
        await page.addInitScript(() => {
          localStorage.setItem(
            "ym:session",
            JSON.stringify({ id: "me", email: "yacine@gdgbatna.com", nick_name: "yacine_dev", role: "admin" }),
          );
          localStorage.setItem("ym:seenWins", JSON.stringify(["c1", "c4"]));
        });
      }
      await page.goto(base + p.url, { waitUntil: "domcontentloaded" });
      await settle(page);
      const file = path.join(outDir, `${p.id}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log("saved", file);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
}

async function diff() {
  const a = OUT.build;
  const b = OUT.design;
  if (!existsSync(a) || !existsSync(b)) {
    console.log("Run both `design` and `build` first.");
    return;
  }
  const files = (await readdir(a)).filter((f) => f.endsWith(".png"));
  const rows = [];
  for (const f of files) {
    const bp = path.join(b, f);
    if (!existsSync(bp)) continue;
    const img1 = PNG.sync.read(readFileSync(path.join(a, f)));
    const img2 = PNG.sync.read(readFileSync(bp));
    const w = Math.min(img1.width, img2.width);
    const h = Math.min(img1.height, img2.height);
    const out = new PNG({ width: w, height: h });
    const n = pixelmatch(img1.data, img2.data, out.data, w, h, { threshold: 0.1 });
    const pct = ((n / (w * h)) * 100).toFixed(2);
    rows.push(`${f}: ${pct}% differing (${w}x${h})`);
    await mkdir("docs/diffs", { recursive: true });
    await writeFile(path.join("docs/diffs", f), PNG.sync.write(out));
  }
  console.log(rows.join("\n"));
}

if (MODE === "design") await shoot("http://localhost:4173", DESIGN_PAGES, OUT.design);
else if (MODE === "diff") await diff();
else await shoot("http://localhost:3000", BUILD_PAGES, OUT.build);
