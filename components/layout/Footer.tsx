"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/app/AuthContext";
import useIsDesktop from "@/lib/useIsDesktop";

export const SOCIALS: { name: string; icon: string; handle: string; href: string }[] = [
  { name: "Discord", icon: "message-circle", handle: "gdgbatna", href: "https://discord.gg/gdgbatna" },
  { name: "Instagram", icon: "instagram", handle: "@gdg_batna", href: "https://instagram.com/gdg_batna" },
  { name: "Facebook", icon: "facebook", handle: "gdgbatna", href: "https://facebook.com/gdgbatna" },
  { name: "X / Twitter", icon: "twitter", handle: "@GDGBatna", href: "https://twitter.com/GDGBatna" },
  { name: "LinkedIn", icon: "linkedin", handle: "gdg-batna", href: "https://linkedin.com/company/gdg-batna" },
  { name: "YouTube", icon: "youtube", handle: "@gdgbatna", href: "https://youtube.com/@gdgbatna" },
];

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

const LINKS: [string, string][] = [
  ["Challenges", "/challenges"],
  ["Leaderboard", "/leaderboard"],
  ["Resources", "/resources"],
  ["Community", "/community"],
];

const PROTECTED = new Set(["/challenges", "/leaderboard"]);

export default function Footer() {
  const desk = useIsDesktop();
  const router = useRouter();
  const { user } = useAuth();

  const go = (href: string) => () => {
    if (PROTECTED.has(href) && !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
    window.scrollTo(0, 0);
  };

  return (
    <footer style={{ background: "var(--bg2)" }}>
      <div aria-hidden="true" style={{ display: "flex", height: 4 }}>
        {COLS.map((c) => (
          <span key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: desk ? "48px 24px 28px" : "32px 16px 24px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
          gap: 36,
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", gridColumn: `span ${desk ? 2 : 1}` }}>
          <span
            style={{
              flex: "none",
              width: 92,
              height: 128,
              borderRadius: 18,
              background: "#fff",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Image
              src="/assets/gdgc-logo.png"
              alt="GDGC Univ. Batna 2 logo"
              width={600}
              height={917}
              style={{ height: 104, width: "auto" }}
            />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 21 }}>CHATOOOR</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--fg2)" }}>
              The challenge arena of GDG Batna’s Dev Department. Google Developer Groups on Campus, Univ. Batna 2.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15 }}>
          <b style={{ fontSize: 12.5, letterSpacing: ".06em", color: "var(--fg3)" }}>PLATFORM</b>
          {LINKS.map(([label, href]) => (
            <button
              key={href}
              onClick={go(href)}
              className="ym-footlink"
              style={{
                alignSelf: "flex-start",
                padding: "4px 0",
                border: 0,
                background: "transparent",
                color: "var(--fg)",
                font: "500 15px var(--fu)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b style={{ fontSize: 12.5, letterSpacing: ".06em", color: "var(--fg3)" }}>FIND US</b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SOCIALS.map((x) => (
              <a
                key={x.name}
                href={x.href}
                target="_blank"
                rel="noopener"
                aria-label={x.name}
                className="ym-social"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  color: "var(--fg2)",
                }}
              >
                <Icon n={x.icon} s={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "18px 24px 26px",
          boxSizing: "border-box",
          borderTop: "1px solid var(--ln)",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "space-between",
          fontSize: 13.5,
          color: "var(--fg3)",
        }}
      >
        <span>© 2026 GDGC Univ. Batna 2 · Dev Department</span>
        <span style={{ fontFamily: "var(--fm)" }}>Season 1 · Dec 10 → Jan 10</span>
      </div>
    </footer>
  );
}
