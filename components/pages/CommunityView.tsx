"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { SOCIALS } from "@/components/layout/Footer";
import { useAuth } from "@/app/AuthContext";
import useIsDesktop from "@/lib/useIsDesktop";

const ACTS = [
  { icon: "hammer", t: "Workshops", d: "Hands-on sessions on web, mobile, cloud and AI, run by members.", c: "var(--B)" },
  { icon: "users-round", t: "Community support", d: "Mentors and peers who answer questions and review code.", c: "var(--R)" },
  { icon: "rocket", t: "Hackathons", d: "Weekend sprints to build, pitch and win as a team.", c: "var(--Y)" },
  { icon: "mic", t: "Tech talks & meetups", d: "Speakers from the industry and the club, plus DevFest.", c: "var(--G)" },
];

export default function CommunityView() {
  const desk = useIsDesktop();
  const router = useRouter();
  const { user } = useAuth();

  const pad = desk ? "32px 28px 120px" : "20px 16px 160px";
  const cmPad = desk ? 32 : 20;
  const cmH1 = desk ? 36 : 24;
  const cmH2 = desk ? 30 : 22;
  const logoW = desk ? 140 : 96;
  const logoH = desk ? 196 : 134;
  const logoImgH = desk ? 164 : 112;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: pad, display: "flex", flexDirection: "column", gap: 36, boxSizing: "border-box" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 18 }}>
        <div
          style={{
            borderRadius: 26,
            background: "var(--s1)",
            border: "1px solid var(--ln)",
            padding: cmPad,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
          }}
        >
          <span
            style={{
              flex: "none",
              width: logoW,
              height: logoH,
              borderRadius: 22,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              src="/assets/gdgc-logo.png"
              alt="GDGC Univ. Batna 2 logo"
              width={600}
              height={917}
              style={{ display: "block", height: logoImgH, width: "auto", maxWidth: "none" }}
            />
          </span>
          <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--fg3)" }}>&lt;community/&gt;</span>
            <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: cmH1, lineHeight: 1.08, letterSpacing: "-.02em" }}>
              Google Developer Groups Batna
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--fg2)" }}>
              A student-run community at Univ. Batna 2 for anyone who builds. Workshops, hackathons, talks and a lot of late-night
              debugging together.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span
                style={{
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 10,
                  background: "var(--s2)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Icon n="map-pin" s={15} style={{ color: "var(--Rt)" }} />
                Batna, Algeria
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 10,
                  background: "var(--s2)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <Icon n="users" s={15} style={{ color: "var(--Bt)" }} />
                300+ members
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 26,
            background: "var(--btn)",
            color: "#fff",
            padding: cmPad,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", right: -40, bottom: -30, width: 260, height: 180, opacity: 0.18 }}>
            <span style={{ position: "absolute", right: 0, top: 70, width: 140, height: 40, borderRadius: 20, background: "#fff", transform: "rotate(30deg)", transformOrigin: "120px 20px" }} />
            <span style={{ position: "absolute", right: 0, top: 70, width: 140, height: 40, borderRadius: 20, background: "#fff", transform: "rotate(-30deg)", transformOrigin: "120px 20px" }} />
          </div>
          <span style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" }}>
            <Icon n="message-circle" s={27} />
          </span>
          <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: cmH2, lineHeight: 1.1 }}>The club lives on Discord.</h2>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, maxWidth: 420 }}>
            Ask for help on a challenge, find teammates for hackathons and hear about new quests first.
          </p>
          <div style={{ position: "relative", marginTop: "auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
            <a
              href="https://discord.gg/gdgbatna"
              target="_blank"
              rel="noopener"
              style={{
                whiteSpace: "nowrap",
                height: 52,
                padding: "0 20px",
                borderRadius: 14,
                background: "#fff",
                color: "#174EA6",
                boxShadow: "0 4px 0 rgba(0,0,0,.25)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              Join Discord server
              <Icon n="external-link" s={17} />
            </a>
            <span style={{ fontFamily: "var(--fm)", fontSize: 13.5, whiteSpace: "nowrap" }}>discord.gg/gdgbatna</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 700, fontSize: 26 }}>What we do</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 14 }}>
          {ACTS.map((a) => (
            <div key={a.t} style={{ borderRadius: 20, background: "var(--s1)", border: "1px solid var(--ln)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 4, background: a.c }} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--s2)" }}>
                  <Icon n={a.icon} s={22} />
                </span>
                <b style={{ fontSize: 17 }}>{a.t}</b>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--fg2)" }}>{a.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 700, fontSize: 26 }}>Follow the club</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: 12 }}>
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener"
              className="ym-socialcard"
              style={{
                borderRadius: 18,
                background: "var(--s1)",
                border: "1px solid var(--ln)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                color: "var(--fg)",
                transition: "background .12s, border-color .12s",
              }}
            >
              <span style={{ display: "flex", justifyContent: "space-between" }}>
                <Icon n={s.icon} s={22} />
                <Icon n="arrow-up-right" s={16} style={{ color: "var(--fg3)" }} />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <b style={{ fontSize: 15 }}>{s.name}</b>
                <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--fg3)" }}>{s.handle}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {!user ? (
        <div
          style={{
            borderRadius: 24,
            background: "var(--Y)",
            color: "var(--onY)",
            padding: cmPad,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 6 }}>
            <b style={{ fontFamily: "var(--fd)", fontSize: 24, lineHeight: 1.1 }}>Already in the club?</b>
            <span style={{ fontSize: 15.5, fontWeight: 500 }}>Create your player profile and start climbing the board.</span>
          </div>
          <button
            onClick={() => router.push("/register")}
            className="ym-press"
            style={{
              height: 52,
              padding: "0 22px",
              border: 0,
              borderRadius: 14,
              background: "#1E1C2E",
              boxShadow: "0 4px 0 #000",
              color: "#fff",
              font: "700 16px var(--fu)",
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
              ["--base" as string]: "#000",
            }}
          >
            <Icon n="gamepad-2" s={19} />
            Join the arena
          </button>
        </div>
      ) : null}
    </main>
  );
}
