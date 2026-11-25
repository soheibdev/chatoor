"use client";

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * "Meet the Dev-Shirt Coder" CTA.
 *
 * The mascot breaks out of the yellow card: his head and arm rise above the top edge into the
 * page background, and a clip-path cuts him off at the card's bottom edge. Hovering or
 * keyboard-focusing the CTA swaps the idle (thumbs-up) pose for the pointing pose — pure CSS,
 * driven by `group-has-[a[data-cta]:hover]` / `:focus-visible` on the card.
 *
 * Every Tailwind class here is written out in full: the scanner reads source text, so a class
 * assembled from a variable or template literal is never generated.
 *
 * 760px is this project's desktop breakpoint (lib/useIsDesktop.ts), so the breakout and the
 * hover affordance start there rather than at Tailwind's `md`.
 */
export default function DevShirtCTA({
  href,
  h2Fs,
  bannerPad,
}: {
  /** where "Start a challenge" goes — guests are routed through login by the caller */
  href: string;
  h2Fs: number;
  bannerPad: number;
}) {
  return (
    <div
      className="dsc group relative overflow-hidden min-[760px]:overflow-visible"
      style={{ borderRadius: 32, background: "var(--Y)", color: "var(--onY)" }}
    >
      {/* ------------------------------- copy ------------------------------- */}
      <div
        className="relative z-10 min-[760px]:max-w-[52%]"
        style={{ padding: bannerPad, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}
      >
        <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 600 }}>
          &lt;new_quest/&gt;
        </span>
        <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 900, fontSize: h2Fs, lineHeight: 1, letterSpacing: "-.03em" }}>
          Meet the Dev-Shirt Coder.
        </h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, maxWidth: 460, fontWeight: 500 }}>
          A new quest drops every week. Pick one, ship it, and watch your name climb.
        </p>
        <Link
          href={href}
          data-cta
          className="ym-press"
          style={{
            alignSelf: "flex-start",
            height: 54,
            padding: "0 24px",
            border: 0,
            borderRadius: 14,
            background: "#1E1C2E",
            boxShadow: "0 4px 0 #000",
            color: "#fff",
            font: "700 16px var(--fu)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            ["--base" as string]: "#000",
          }}
        >
          <Icon n="swords" s={19} />
          Start a challenge
        </Link>
      </div>

      {/* --------------------------- mascot · desktop --------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 bottom-0 right-6 hidden w-[440px] origin-bottom transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] min-[760px]:block lg:right-10 lg:w-[540px] motion-reduce:transition-none group-has-[a[data-cta]:focus-visible]:scale-[1.03] group-has-[a[data-cta]:hover]:scale-[1.03]"
        // overflow allowed above and to the sides, cut dead at the card's bottom edge
        style={{ clipPath: "inset(-300px -300px 0 -600px)" }}
      >
        <div className="relative h-full w-full">
          <Image
            src="/mascot/mascot-idle.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 540px, 440px"
            loading="eager"
            className="object-cover object-top transition-opacity duration-75 group-has-[a[data-cta]:focus-visible]:opacity-0 group-has-[a[data-cta]:hover]:opacity-0"
            style={{ filter: "drop-shadow(0 26px 30px rgba(32,26,0,.38))" }}
          />
          <Image
            src="/mascot/mascot-point.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 540px, 440px"
            loading="eager"
            className="object-cover object-top opacity-0 transition-opacity duration-75 group-has-[a[data-cta]:focus-visible]:opacity-100 group-has-[a[data-cta]:hover]:opacity-100"
            style={{ filter: "drop-shadow(0 26px 30px rgba(32,26,0,.38))" }}
          />
        </div>

        {/* speech bubble — only while pointing */}
        <span className="absolute left-[-26px] top-[96px] z-20 origin-bottom-right scale-50 opacity-0 transition-[transform,opacity] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none group-has-[a[data-cta]:focus-visible]:scale-100 group-has-[a[data-cta]:focus-visible]:opacity-100 group-has-[a[data-cta]:hover]:scale-100 group-has-[a[data-cta]:hover]:opacity-100">
          <span
            className="box-border block whitespace-nowrap rounded-[14px] bg-white px-4 py-2.5 text-[15px] font-bold"
            style={{ color: "#1E1C2E", boxShadow: "0 10px 24px rgba(32,26,0,.28)" }}
          >
            That one! 👉
          </span>
          <span aria-hidden="true" className="absolute -bottom-[6px] right-8 h-4 w-4 rotate-45 bg-white" style={{ borderRadius: 3 }} />
        </span>

        {/* floating chips */}
        <span
          className="dsc-float absolute left-[2px] top-[10px] z-20 box-border block -rotate-6 rounded-[10px] px-3 py-1.5 text-[13px] font-bold"
          style={{
            background: "#111827",
            color: "var(--Y)",
            fontFamily: "var(--fm)",
            boxShadow: "0 8px 18px rgba(32,26,0,.3)",
            animationDuration: "4s",
            animationDelay: "0s",
          }}
        >
          +150 XP
        </span>
        <span
          className="dsc-float absolute right-[6px] top-[215px] z-20 box-border block rotate-6 rounded-[10px] px-3 py-1.5 text-[13px] font-bold text-white"
          style={{
            background: "#EA4335",
            fontFamily: "var(--fm)",
            boxShadow: "0 8px 18px rgba(32,26,0,.3)",
            animationDuration: "5s",
            animationDelay: ".8s",
          }}
        >
          🚩 CTF
        </span>
      </div>

      {/* --------------------------- mascot · mobile --------------------------- */}
      <div aria-hidden="true" className="relative mt-2 h-72 w-full min-[760px]:hidden">
        <Image src="/mascot/mascot-idle.webp" alt="" fill sizes="100vw" loading="eager" className="object-cover object-top" />
      </div>
    </div>
  );
}
