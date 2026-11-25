import { chromium } from "playwright";
const b = await chromium.launch();

// --- reduced motion ---
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForTimeout(1200);
  await p.locator(".dsc").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const chip = document.querySelector(".dsc-float");
    const wrap = document.querySelector(".dsc [style*='clipPath'], .dsc [style*='clip-path']");
    return {
      chipAnimation: getComputedStyle(chip).animationName,
      chipTransform: getComputedStyle(chip).transform,
      wrapTransitionDuration: wrap ? getComputedStyle(wrap).transitionDuration : null,
    };
  });
  console.log("reduced-motion:", JSON.stringify(r));
  // pose swap must still work
  await p.locator("a[data-cta]").hover();
  await p.waitForTimeout(300);
  const op = await p.evaluate(() => getComputedStyle(document.querySelector('.dsc img[src*="mascot-point"]')).opacity);
  console.log("reduced-motion pose swap, point opacity on hover:", op);
  await c.close();
}

// --- layout shift + head clearance ---
{
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(() => document.fonts?.ready);
  // scroll the whole page so everything loads, then settle
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(2000);
  const cls = await p.evaluate(() => window.__cls);
  console.log("cumulative layout shift (whole page):", cls.toFixed(4));

  const gap = await p.evaluate(() => {
    const card = document.querySelector(".dsc");
    const wrap = card.querySelector("[style*='clip-path'], [style*='clipPath']");
    const prev = card.closest("section").previousElementSibling;
    const mascotTop = wrap.getBoundingClientRect().top;
    const prevBottom = prev.getBoundingClientRect().bottom;
    return { mascotTopAbovePrevSectionBy: Math.round(mascotTop - prevBottom) };
  });
  console.log("head clearance (px between previous section bottom and mascot top):", gap.mascotTopAbovePrevSectionBy);
  await c.close();
}
await b.close();
