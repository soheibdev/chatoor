"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import useIsDesktop from "@/lib/useIsDesktop";
import { CAT, LV, TYPE, resources, type ResCat } from "@/app/data/resources.data";

const CATS: [string, string, string, "B" | "R" | "G" | undefined][] = [
  ["all", "All resources", "layout-grid", undefined],
  ["web-dev", "Web Development", "globe", undefined],
  ["cybersecurity", "Cybersecurity", "shield", "R"],
  ["ai-ml", "AI & Machine Learning", "brain", "G"],
  ["problem-solving", "Problem Solving", "code-xml", "B"],
  ["devops", "DevOps", "server", undefined],
];

const LANGS: [string, string, string, string][] = [
  ["all", "All languages", "languages", "var(--fu)"],
  ["en", "EN", "globe", "var(--fu)"],
  ["ar", "العربية", "languages", "var(--far)"],
];

export default function ResourcesView() {
  const desk = useIsDesktop();
  const [rq, setRq] = useState("");
  const [rcat, setRcat] = useState("all");
  const [rlang, setRlang] = useState("all");

  const q = rq.trim().toLowerCase();
  const base = resources.filter(
    (r) => (!q || (r.title + " " + r.desc).toLowerCase().includes(q)) && (rlang === "all" || r.lang === rlang),
  );
  const list = base.filter((r) => rcat === "all" || r.cat === rcat);

  const rStats = [
    { v: resources.length, k: "resources" },
    { v: resources.filter((r) => r.free).length, k: "free" },
    { v: resources.filter((r) => r.lang === "ar").length, k: "in Arabic" },
    { v: 5, k: "categories" },
  ];

  const pad = desk ? "32px 28px 120px" : "20px 16px 160px";
  const h1 = desk ? 44 : 28;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: pad, display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--fg3)" }}>&lt;resources/&gt;</span>
          <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: h1, letterSpacing: "-.025em", lineHeight: 1.05 }}>
            Learning resources
          </h1>
          <span style={{ fontSize: 15.5, color: "var(--fg2)" }}>Hand-picked by the Dev Department to get you quest-ready.</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            borderRadius: 18,
            background: "var(--s1)",
            border: "1px solid var(--ln)",
            overflow: "hidden",
            flex: "0 1 480px",
          }}
        >
          {rStats.map((s) => (
            <div
              key={s.k}
              style={{
                padding: "12px 16px",
                borderInlineStart: "1px solid var(--ln)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                marginInlineStart: -1,
              }}
            >
              <span style={{ fontFamily: "var(--fd)", fontWeight: 800, fontSize: 22 }}>{s.v}</span>
              <span style={{ fontSize: 12, color: "var(--fg3)" }}>{s.k}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, borderRadius: 20, background: "var(--bg2)", border: "1px solid var(--ln)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <label
            style={{
              flex: "1 1 260px",
              maxWidth: 460,
              height: 46,
              borderRadius: 12,
              background: "var(--bg)",
              border: "1px solid var(--ln2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              color: "var(--fg3)",
            }}
          >
            <Icon n="search" s={18} />
            <input
              aria-label="Search resources"
              value={rq}
              onChange={(e) => setRq(e.target.value)}
              placeholder="Search titles and descriptions…"
              style={{ flex: 1, minWidth: 0, height: "100%", border: 0, outline: 0, background: "transparent", color: "var(--fg)", font: "400 15px var(--fu)" }}
            />
            {rq ? (
              <button
                aria-label="Clear search"
                onClick={() => setRq("")}
                style={{ width: 30, height: 30, border: 0, borderRadius: 8, background: "var(--s2)", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <Icon n="x" s={14} />
              </button>
            ) : null}
          </label>
          <div
            role="radiogroup"
            aria-label="Language"
            style={{ marginInlineStart: "auto", display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--ln)" }}
          >
            {LANGS.map(([id, label, icon, ff]) => {
              const on = rlang === id;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setRlang(id)}
                  style={{
                    whiteSpace: "nowrap",
                    height: 36,
                    padding: "0 13px",
                    border: 0,
                    borderRadius: 9,
                    background: on ? "var(--s2)" : "transparent",
                    color: on ? "var(--fg)" : "var(--fg2)",
                    font: `600 14px ${ff}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                  }}
                >
                  <Icon n={icon} s={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATS.map(([id, label, icon, k]) => {
            const on = rcat === id;
            const n = base.filter((r) => id === "all" || r.cat === id).length;
            return (
              <button
                key={id}
                aria-pressed={on}
                onClick={() => setRcat(id)}
                style={{
                  whiteSpace: "nowrap",
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: `1px solid ${on ? "var(--fg)" : k ? "transparent" : "var(--ln2)"}`,
                  background: on ? "var(--fg)" : k ? `var(--${k}s)` : "transparent",
                  color: on ? "var(--bg)" : k ? `var(--${k}t)` : "var(--fg2)",
                  font: "600 14px var(--fu)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  cursor: "pointer",
                }}
              >
                <Icon n={icon} s={15} />
                {label}
                <span style={{ fontSize: 11.5, opacity: 0.8 }}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {list.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(auto-fill,minmax(320px,1fr))" : "minmax(0,1fr)", gap: 18 }}>
          {list.map((r) => {
            const ar = r.lang === "ar";
            const [cl, , k, cla] = CAT[r.cat as ResCat];
            const [icon, tl, ta] = TYPE[r.type];
            const cs = k ? `var(--${k}s)` : "var(--s2)";
            const ct = k ? `var(--${k}t)` : "var(--fg)";
            return (
              <article
                key={r.title}
                dir={ar ? "rtl" : "ltr"}
                lang={ar ? "ar" : "en"}
                className="ym-res"
                style={{
                  borderRadius: 20,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  fontFamily: ar ? "var(--far)" : "var(--fu)",
                  transition: "border-color .15s, transform .15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: cs, color: ct }}>
                    <Icon n={icon} s={19} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", color: "var(--fg3)" }}>{ar ? ta : tl}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: ct }}>{ar ? cla : cl}</span>
                  </span>
                  <span style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
                    <span
                      style={{
                        height: 24,
                        padding: "0 8px",
                        borderRadius: 7,
                        background: "var(--s2)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: ".03em",
                        color: "var(--fg2)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {LV[r.lvl][ar ? 1 : 0]}
                    </span>
                    {ar ? (
                      <span
                        style={{
                          height: 24,
                          padding: "0 8px",
                          borderRadius: 7,
                          background: "var(--fg)",
                          color: "var(--bg)",
                          fontFamily: "var(--fu)",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        AR
                      </span>
                    ) : null}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: ar ? 19 : 18, fontWeight: 700, lineHeight: ar ? 1.6 : 1.35 }}>{r.title}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: ar ? 15 : 14, lineHeight: ar ? 1.6 : 1.55, color: "var(--fg2)" }}>{r.desc}</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        height: 24,
                        padding: "0 8px",
                        borderRadius: 7,
                        border: "1px solid var(--ln)",
                        fontFamily: "var(--fm)",
                        fontSize: 11.5,
                        color: "var(--fg2)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <bdi>{t}</bdi>
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    paddingTop: 14,
                    borderTop: "1px dashed var(--ln)",
                    fontSize: 13,
                    color: "var(--fg2)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon n="clock-3" s={14} />
                    {r.hours}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--fu)" }}>
                    <Icon n="star" s={14} f style={{ color: "var(--Yt)" }} />
                    <bdi>{r.rating}</bdi>
                  </span>
                  <span
                    style={{
                      height: 24,
                      padding: "0 8px",
                      borderRadius: 7,
                      fontSize: 11.5,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      background: r.free ? "var(--Gs)" : "var(--s2)",
                      color: r.free ? "var(--Gt)" : "var(--fg2)",
                    }}
                  >
                    {r.free ? (ar ? "مجاني" : "FREE") : ar ? "مدفوع" : "PREMIUM"}
                  </span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener"
                    style={{
                      marginInlineStart: "auto",
                      height: 38,
                      padding: "0 12px",
                      borderRadius: 10,
                      background: "var(--s2)",
                      border: "1px solid var(--ln2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontWeight: 700,
                      color: "var(--fg)",
                    }}
                  >
                    {ar ? "زيارة" : "Visit"}
                    <Icon n="external-link" s={14} className="rtl:-scale-x-100" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: 22,
            border: "1px dashed var(--ln2)",
            background: "var(--s1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 10,
          }}
        >
          <Icon n="search-x" s={28} style={{ color: "var(--fg3)" }} />
          <b style={{ fontSize: 18 }}>Nothing on the shelf for that</b>
          <span style={{ fontSize: 14.5, color: "var(--fg2)" }}>
            Try another category or language, or ask for a recommendation on Discord.
          </span>
          <button
            onClick={() => {
              setRq("");
              setRcat("all");
              setRlang("all");
            }}
            style={{
              marginTop: 6,
              height: 42,
              padding: "0 16px",
              borderRadius: 12,
              border: "1px solid var(--ln2)",
              background: "transparent",
              color: "var(--fg)",
              font: "700 14px var(--fu)",
              display: "flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
            }}
          >
            <Icon n="rotate-ccw" s={15} />
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}
