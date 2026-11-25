import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await c.newPage();
await page.goto("http://localhost:3000/");
await page.waitForLoadState("networkidle").catch(() => {});
await page.evaluate(() => document.fonts?.ready);
await page.waitForTimeout(4000); // let the type-on + glitch + brush finish
const sec = page.locator('section[role="region"]');
await sec.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await sec.screenshot({ path: "docs/build-shots/state-makers-closed.png" });
// hover to open the panel (160ms dwell), then hover P1
await sec.hover({ position: { x: 700, y: 400 } });
await page.waitForTimeout(1200);
await sec.screenshot({ path: "docs/build-shots/state-makers-open.png" });
await sec.hover({ position: { x: 560, y: 420 } });
await page.waitForTimeout(900);
await sec.screenshot({ path: "docs/build-shots/state-makers-p1.png" });
console.log("ok");
await b.close();
