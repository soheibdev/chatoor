"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import useIsDesktop from "@/lib/useIsDesktop";

/** Screens 6 · 404a (desktop) and 404b (mobile). */
export default function NotFoundView() {
  const desk = useIsDesktop();
  const pathname = usePathname() || "/";

  if (!desk) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 148px)",
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        <span style={{ width: 84, height: 120, borderRadius: 18, background: "#fff", display: "grid", placeItems: "center" }}>
          <Image src="/assets/gdgc-logo.png" alt="GDGC Univ. Batna 2" width={600} height={917} style={{ height: 100, width: "auto" }} />
        </span>
        <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-.04em" }}>404</span>
        <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 24 }}>This level doesn’t exist.</h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--fg2)" }}>The page moved, got renamed, or never spawned.</p>
        <Link
          href="/challenges"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 14,
            background: "var(--btn)",
            boxShadow: "0 4px 0 var(--btnd)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            fontWeight: 700,
          }}
        >
          <Icon n="swords" s={18} />
          Back to challenges
        </Link>
        <span style={{ fontFamily: "var(--fm)", fontSize: 12.5, color: "var(--fg3)" }}>{pathname}</span>
      </main>
    );
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 24,
        overflow: "hidden",
      }}
    >
      <div aria-hidden="true" style={{ position: "relative", width: 760, maxWidth: "100%", height: 220 }}>
        <span style={{ position: "absolute", left: 0, top: 82, width: 150, height: 46, borderRadius: 23, background: "var(--R)", transform: "rotate(-30deg)", transformOrigin: "23px 23px" }} />
        <span style={{ position: "absolute", left: 0, top: 82, width: 150, height: 46, borderRadius: 23, background: "var(--B)", transform: "rotate(30deg)", transformOrigin: "23px 23px" }} />
        <span style={{ position: "absolute", left: 0, right: 0, top: 20, fontFamily: "var(--fd)", fontWeight: 900, fontSize: 180, lineHeight: 1, letterSpacing: "-.04em" }}>404</span>
        <span style={{ position: "absolute", right: 0, top: 82, width: 150, height: 46, borderRadius: 23, background: "var(--G)", transform: "rotate(30deg)", transformOrigin: "127px 23px" }} />
        <span style={{ position: "absolute", right: 0, top: 82, width: 150, height: 46, borderRadius: 23, background: "var(--Y)", transform: "rotate(-30deg)", transformOrigin: "127px 23px" }} />
      </div>
      <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 40, letterSpacing: "-.02em" }}>This level doesn’t exist.</h1>
      <p style={{ margin: 0, maxWidth: 520, fontSize: 17, lineHeight: 1.55, color: "var(--fg2)" }}>
        The page moved, got renamed, or never spawned. Your points are right where you left them.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        <Link
          href="/challenges"
          className="ym-press"
          style={{
            height: 52,
            padding: "0 22px",
            borderRadius: 14,
            background: "var(--btn)",
            boxShadow: "0 4px 0 var(--btnd)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          <Icon n="swords" s={18} />
          Back to challenges
        </Link>
        <Link
          href="/"
          style={{
            height: 52,
            padding: "0 20px",
            borderRadius: 14,
            border: "1px solid var(--ln2)",
            background: "var(--s1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          <Icon n="house" s={17} />
          Home
        </Link>
      </div>
      <span style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--fg3)", marginTop: 8 }}>{pathname}</span>
    </main>
  );
}
