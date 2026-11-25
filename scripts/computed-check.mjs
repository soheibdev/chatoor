/** §14.4 — compare computed styles of key elements between the design and this build. */
import { chromium } from "playwright";

const PROPS = ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "borderRadius", "padding", "height", "boxShadow", "fontFamily"];

async function read(page, sel) {
  return page.evaluate(
    ([s, props]) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const c = getComputedStyle(el);
      const o = {};
      for (const p of props) o[p] = c[p];
      o.__rect = { w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) };
      return o;
    },
    [sel, PROPS],
  );
}

const b = await chromium.launch();

const design = await b.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await design.newPage();
await dp.goto("http://localhost:4173/Prototype.dc.html", { waitUntil: "domcontentloaded" });
await dp.waitForLoadState("networkidle").catch(() => {});
await dp.waitForTimeout(4000);

const build = await b.newContext({ viewport: { width: 1440, height: 900 } });
const bp = await build.newPage();
await bp.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await bp.waitForLoadState("networkidle").catch(() => {});
await bp.waitForTimeout(2000);

const CASES = [
  ["navbar header", "header"],
  ["hero h1", "h1"],
  ["hero primary CTA", "main button"],
  ["season card", 'main [style*="border-radius:24px"], main div[style*="24px"]'],
];

for (const [name, sel] of CASES) {
  const d = await read(dp, sel);
  const u = await read(bp, sel);
  if (!d || !u) {
    console.log(`\n${name}: missing on ${!d ? "design" : "build"}`);
    continue;
  }
  const diffs = PROPS.filter((p) => d[p] !== u[p]).map((p) => `    ${p}: design=${d[p]}  build=${u[p]}`);
  const rect = d.__rect.w !== u.__rect.w || d.__rect.h !== u.__rect.h ? [`    size: design=${d.__rect.w}x${d.__rect.h}  build=${u.__rect.w}x${u.__rect.h}`] : [];
  console.log(`\n${name}: ${diffs.length + rect.length === 0 ? "identical" : ""}`);
  [...rect, ...diffs].forEach((l) => console.log(l));
}

await b.close();
