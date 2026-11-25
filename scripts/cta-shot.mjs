import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "docs/cta-shots";
await mkdir(OUT, { recursive: true });
const b = await chromium.launch();
const errors = [];

for (const [name, w, h] of [["1440", 1440, 900], ["1024", 1024, 900], ["375", 375, 812]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await c.newPage();
  p.on("console", (m) => { if (m.type() === "error") errors.push(`${name}: ${m.text()}`); });
  p.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  await p.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(() => document.fonts?.ready);
  await p.waitForTimeout(1500);

  const card = p.locator(".dsc");
  await card.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);

  // region around the card so the breakout is visible
  const box = await card.boundingBox();
  const clip = { x: 0, y: Math.max(0, box.y - 140), width: w, height: Math.min(h, box.height + 200) };
  await p.screenshot({ path: `${OUT}/cta-${name}-idle.png`, clip });

  if (name !== "375") {
    await p.locator("a[data-cta]").hover();
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/cta-${name}-hover.png`, clip });

    // keyboard focus
    await p.mouse.move(5, 5);
    await p.waitForTimeout(400);
    await p.locator("a[data-cta]").evaluate((el) => el.focus());
    await p.keyboard.press("Tab");
    await p.keyboard.press("Shift+Tab");
    await p.waitForTimeout(600);
    const pointing = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('.dsc img[src*="mascot-point"]')];
      return imgs.map((i) => getComputedStyle(i).opacity);
    });
    console.log(`${name}: point-image opacity while focus-visible =`, pointing.join(","));
    await p.screenshot({ path: `${OUT}/cta-${name}-focus.png`, clip });
  }
  await c.close();
}
console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await b.close();
