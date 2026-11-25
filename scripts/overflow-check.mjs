import { chromium } from "playwright";
const WIDTHS = [320, 360, 390, 600, 759, 760, 768, 1024, 1280, 1440, 1920];
const PAGES = ["/", "/login", "/register", "/resources", "/community", "/challenges", "/leaderboard", "/dashboard/users", "/dashboard/submissions", "/nope"];
const b = await chromium.launch();
const bad = [];
for (const w of WIDTHS) {
  const c = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await c.addInitScript(() => localStorage.setItem("ym:session", JSON.stringify({ id: "me", email: "y@g.com", nick_name: "yacine_dev", role: "admin" })));
  const p = await c.newPage();
  for (const url of PAGES) {
    await p.goto("http://localhost:3000" + url, { waitUntil: "domcontentloaded" });
    await p.waitForLoadState("networkidle").catch(() => {});
    await p.waitForTimeout(500);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) bad.push(`${w}px ${url}: +${over}px`);
  }
  await c.close();
}
console.log(bad.length ? bad.join("\n") : "no horizontal overflow at any width");
await b.close();
