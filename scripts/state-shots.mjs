/** Interactive-state shots: modals, overlays, slide-over, light mode, mobile. */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "docs/build-shots";
const SESSION = () => {
  localStorage.setItem(
    "ym:session",
    JSON.stringify({ id: "me", email: "yacine@gdgbatna.com", nick_name: "yacine_dev", role: "admin" }),
  );
  localStorage.setItem("ym:seenWins", JSON.stringify(["c1", "c4"]));
};

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

async function ctx(w, h, theme = "dark") {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await c.addInitScript(SESSION);
  if (theme === "light") await c.addInitScript(() => localStorage.setItem("ym:theme", "light"));
  return c;
}

async function settle(page, ms = 700) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(ms);
}

const shots = [];

// 1. CTF submission modal
{
  const c = await ctx(1440, 900);
  const page = await c.newPage();
  await page.goto("http://localhost:3000/challenges");
  await settle(page, 1200);
  await page.getByRole("button", { name: /CTF challenge: Broken Auth/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/state-ctf-modal.png` });
  // typed flag → valid state + format copy
  await page.fill("#pm-in", "gdgbatna{jwt_n0ne_alg}");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/state-ctf-modal-valid.png` });
  shots.push("state-ctf-modal", "state-ctf-modal-valid");
  await c.close();
}

// 2. PS submission modal with history
{
  const c = await ctx(1440, 900);
  const page = await c.newPage();
  await page.goto("http://localhost:3000/challenges");
  await settle(page, 1200);
  await page.getByRole("button", { name: /PS challenge: Matrix Spiral/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/state-ps-modal.png`, fullPage: true });
  shots.push("state-ps-modal");
  await c.close();
}

// 3. Conquered overlay (clear seenWins so a win fires)
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await c.addInitScript(() => {
    localStorage.setItem(
      "ym:session",
      JSON.stringify({ id: "me", email: "yacine@gdgbatna.com", nick_name: "yacine_dev", role: "admin" }),
    );
    localStorage.setItem("ym:lastRank", "14");
  });
  const page = await c.newPage();
  await page.goto("http://localhost:3000/challenges");
  await settle(page, 1500);
  await page.screenshot({ path: `${OUT}/state-conquered.png` });
  shots.push("state-conquered");
  await c.close();
}

// 4. Register slide-over
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await c.newPage();
  await page.goto("http://localhost:3000/?join=1");
  await settle(page, 1200);
  await page.screenshot({ path: `${OUT}/state-join-slideover.png` });
  shots.push("state-join-slideover");
  await c.close();
}

// 5. Light mode, challenges
{
  const c = await ctx(1440, 900, "light");
  const page = await c.newPage();
  await page.goto("http://localhost:3000/challenges");
  await settle(page, 1200);
  await page.screenshot({ path: `${OUT}/state-challenges-light.png`, fullPage: true });
  shots.push("state-challenges-light");
  await c.close();
}

// 6. Mobile: challenges + tab bar, leaderboard, landing makers
{
  const c = await ctx(390, 844);
  const page = await c.newPage();
  await page.goto("http://localhost:3000/challenges");
  await settle(page, 1200);
  await page.screenshot({ path: `${OUT}/state-challenges-mobile.png` });
  await page.goto("http://localhost:3000/leaderboard");
  await settle(page, 1200);
  await page.screenshot({ path: `${OUT}/state-leaderboard-mobile.png` });
  shots.push("state-challenges-mobile", "state-leaderboard-mobile");
  await c.close();
}

// 7. Admin review drawer
{
  const c = await ctx(1440, 900);
  const page = await c.newPage();
  await page.goto("http://localhost:3000/dashboard/submissions");
  await settle(page, 1200);
  await page.getByRole("button", { name: "View submission" }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/state-admin-drawer.png` });
  shots.push("state-admin-drawer");
  await c.close();
}

// 8. Admin edit points modal
{
  const c = await ctx(1440, 900);
  const page = await c.newPage();
  await page.goto("http://localhost:3000/dashboard/users");
  await settle(page, 1200);
  await page.getByRole("button", { name: /Edit points for 0xAmine/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/state-admin-edit-points.png` });
  shots.push("state-admin-edit-points");
  await c.close();
}

// 9. RTL whole-document check
{
  const c = await ctx(1440, 900);
  const page = await c.newPage();
  await page.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.documentElement.setAttribute("dir", "rtl")));
  await page.goto("http://localhost:3000/resources");
  await settle(page, 1200);
  await page.screenshot({ path: `${OUT}/state-resources-rtl.png`, fullPage: true });
  shots.push("state-resources-rtl");
  await c.close();
}

console.log(shots.join("\n"));
await browser.close();
