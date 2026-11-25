"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/app/AuthContext";
import { useAdminChallenges, useAdminSubmissions, useParticipants } from "@/lib/useData";
import { hue, initials } from "@/lib/game";
import { readTheme, toggleTheme, type Theme } from "@/lib/theme";
import { T } from "@/components/ui/toast";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

/**
 * Admin shell: 248px sidebar (68px collapsed, toggled with W), h64 top bar with the real
 * signed-in admin. Denser than the arena: 14px body, 52px rows, 2px button bases, no glow.
 */
export default function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { data: participants } = useParticipants();
  const { data: submissions } = useAdminSubmissions();
  const { data: challenges } = useAdminChallenges();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setTheme(readTheme()), []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        router.replace("/challenges");
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const read = () => setMobile(window.innerWidth < 768);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  /* W collapses the sidebar, F toggles fullscreen — both ignored while typing */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "w" || e.key === "W") setCollapsed((c) => !c);
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [menu]);

  const nick = user?.nick_name || user?.email?.split("@")[0] || "admin";
  const h = hue(nick);
  const pendingN = (submissions ?? []).filter((s) => s.status === "pending").length;

  const links = [
    { href: "/dashboard/users", label: "Participants", icon: "users", count: participants?.length, pending: false },
    { href: "/dashboard/submissions", label: "Submissions", icon: "inbox", count: pendingN, pending: true },
    { href: "/dashboard/challenges", label: "Challenges", icon: "swords", count: challenges?.length, pending: false },
  ];

  const doLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    await logout();
    router.push("/");
    T.loggedOut();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--fg2)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", animation: "ymSpin .8s linear infinite" }}>
            <Icon n="loader-circle" s={22} />
          </span>
          <span style={{ fontSize: 13, color: "var(--fg3)", letterSpacing: ".04em" }}>Verifying administrator credentials…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--fg3)", fontSize: 13.5 }}>
        Redirecting to sign in…
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--fg3)", fontSize: 13.5 }}>
        Redirecting to challenges…
      </div>
    );
  }

  const sidebar = (
    <aside
      style={{
        background: "var(--bg2)",
        borderInlineEnd: "1px solid var(--ln)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: collapsed ? "center" : undefined,
        gap: collapsed ? 6 : 4,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {collapsed ? (
        <span style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", display: "grid", placeItems: "center", marginBottom: 18 }}>
          <Image src="/assets/gdgc-mark.png" alt="GDGC" width={1360} height={719} style={{ width: 25, height: "auto" }} />
        </span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 20px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: "#fff", display: "grid", placeItems: "center" }}>
            <Image src="/assets/gdgc-mark.png" alt="GDGC" width={1360} height={719} style={{ width: 25, height: "auto" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15 }}>CHATOOOR</span>
            <span style={{ fontSize: 11.5, color: "var(--fg3)" }}>Admin · GDG Batna</span>
          </span>
        </div>
      )}

      {!collapsed ? (
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "var(--fg3)", padding: "0 12px 6px" }}>MANAGE</span>
      ) : null}

      {links.map((l) => {
        const on = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            aria-label={collapsed ? l.label : undefined}
            onClick={() => setNavOpen(false)}
            className="ym-sidelink"
            style={
              collapsed
                ? {
                    position: "relative",
                    width: 44,
                    height: 40,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: on ? "var(--s2)" : "transparent",
                    color: on ? "var(--Bt)" : "var(--fg2)",
                  }
                : {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 10,
                    background: on ? "var(--s2)" : "transparent",
                    fontSize: 14,
                    fontWeight: 600,
                    color: on ? "var(--fg)" : "var(--fg2)",
                  }
            }
          >
            <Icon n={l.icon} s={collapsed ? 18 : 17} style={on ? { color: "var(--Bt)" } : undefined} />
            {collapsed ? (
              l.pending && pendingN > 0 ? (
                <span style={{ position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: "50%", background: "var(--Y)" }} />
              ) : null
            ) : (
              <>
                {l.label}
                {l.pending ? (
                  <span
                    style={{
                      marginInlineStart: "auto",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 6,
                      background: "var(--Ys)",
                      color: "var(--Yt)",
                    }}
                  >
                    {l.count ?? 0}
                  </span>
                ) : (
                  <span style={{ marginInlineStart: "auto", fontSize: 12, color: "var(--fg3)" }}>{l.count ?? "—"}</span>
                )}
              </>
            )}
          </Link>
        );
      })}

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: collapsed ? "center" : undefined,
          gap: 4,
          borderTop: collapsed ? 0 : "1px solid var(--ln)",
          paddingTop: 10,
          width: "100%",
        }}
      >
        {collapsed ? null : (
          <Link href="/" className="ym-sidelink" style={{ display: "flex", alignItems: "center", gap: 10, height: 40, padding: "0 12px", borderRadius: 10, fontSize: 14, color: "var(--fg2)" }}>
            <Icon n="arrow-left" s={17} />
            Back to arena
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar (W)" : "Collapse sidebar (W)"}
          style={
            collapsed
              ? { width: 44, height: 40, border: 0, borderRadius: 10, background: "transparent", color: "var(--fg3)", display: "grid", placeItems: "center", cursor: "pointer" }
              : {
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 40,
                  padding: "0 12px",
                  border: 0,
                  borderRadius: 10,
                  background: "transparent",
                  font: "500 13.5px var(--fu)",
                  color: "var(--fg3)",
                  cursor: "pointer",
                }
          }
        >
          <Icon n={collapsed ? "panel-left-open" : "panel-left-close"} s={17} />
          {collapsed ? null : (
            <>
              Collapse
              <span style={{ marginInlineStart: "auto", fontFamily: "var(--fm)", fontSize: 11, padding: "2px 6px", borderRadius: 5, border: "1px solid var(--ln2)" }}>
                W
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobile ? "minmax(0,1fr)" : collapsed ? "68px minmax(0,1fr)" : "248px minmax(0,1fr)",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--fu)",
      }}
    >
      {mobile ? null : sidebar}

      {mobile && navOpen ? (
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(5,4,10,.5)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 248, height: "100%" }}>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            height: mobile ? 60 : 64,
            padding: mobile ? "0 12px" : "0 24px",
            display: "flex",
            alignItems: "center",
            gap: mobile ? 10 : 14,
            borderBottom: "1px solid var(--ln)",
            background: mobile ? "var(--bg2)" : "transparent",
          }}
        >
          {mobile ? (
            <button
              aria-label="Open navigation"
              onClick={() => setNavOpen(true)}
              style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg)", display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <Icon n="menu" s={20} />
            </button>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: mobile ? 11 : 12, color: "var(--fg3)" }}>Admin{mobile ? "" : " /"}</span>
            <b style={{ fontSize: mobile ? 15.5 : 17 }}>{title}</b>
          </div>
          <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {mobile ? null : (
              <>
                <button
                  aria-label="Fullscreen (F)"
                  onClick={() => {
                    if (document.fullscreenElement) void document.exitFullscreen();
                    else void document.documentElement.requestFullscreen().catch(() => {});
                  }}
                  className="ym-admbtn"
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <Icon n="maximize" s={17} />
                </button>
                <button
                  aria-label="Toggle theme"
                  onClick={() => setTheme(toggleTheme())}
                  className="ym-admbtn"
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--ln)", background: "transparent", color: "var(--fg2)", display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <Icon n={theme === "light" ? "moon" : "sun"} s={17} />
                </button>
              </>
            )}
            <div style={{ position: "relative" }} ref={box}>
              <button
                aria-haspopup="menu"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
                style={
                  mobile
                    ? {
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: 12.5,
                        background: `var(--${h}s)`,
                        color: `var(--${h}t)`,
                        border: 0,
                        cursor: "pointer",
                      }
                    : {
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        height: 44,
                        padding: "0 10px 0 4px",
                        borderRadius: 12,
                        border: "1px solid var(--ln2)",
                        background: "var(--s1)",
                        color: "var(--fg)",
                        fontFamily: "var(--fu)",
                        cursor: "pointer",
                      }
                }
              >
                {mobile ? (
                  initials(nick)
                ) : (
                  <>
                    <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12.5, background: `var(--${h}s)`, color: `var(--${h}t)` }}>
                      {initials(nick)}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
                      <b style={{ fontSize: 13.5 }}>{nick}</b>
                      <span style={{ fontSize: 11.5, color: "var(--fg3)" }}>{user?.email}</span>
                    </span>
                    <Icon n="chevron-down" s={15} style={{ color: "var(--fg3)" }} />
                  </>
                )}
              </button>
              {menu ? (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    insetInlineEnd: 0,
                    top: 50,
                    zIndex: 3,
                    width: 260,
                    borderRadius: 16,
                    background: "var(--s1)",
                    border: "1px solid var(--ln2)",
                    boxShadow: "var(--sh)",
                    overflow: "hidden",
                  }}
                >
                  <div aria-hidden="true" style={{ display: "flex", height: 3 }}>
                    {COLS.map((c) => (
                      <span key={c} style={{ flex: 1, background: c }} />
                    ))}
                  </div>
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid var(--ln)" }}>
                    <b style={{ fontSize: 14 }}>{nick}</b>
                    <span style={{ fontSize: 12.5, color: "var(--fg3)" }}>{user?.email}</span>
                    <span
                      style={{
                        alignSelf: "flex-start",
                        marginTop: 6,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: ".06em",
                        padding: "3px 7px",
                        borderRadius: 6,
                        background: "var(--Bs)",
                        color: "var(--Bt)",
                      }}
                    >
                      ROLE · ADMIN
                    </span>
                  </div>
                  <div style={{ padding: 6 }}>
                    <Link href="/" role="menuitem" className="ym-menuitem" style={{ display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 10px", borderRadius: 9, fontSize: 13.5 }}>
                      <Icon n="swords" s={15} />
                      Open the arena
                    </Link>
                    <a href="#" role="menuitem" onClick={doLogout} className="ym-menuitem-danger" style={{ display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 10px", borderRadius: 9, fontSize: 13.5, color: "var(--Rt)" }}>
                      <Icon n="log-out" s={15} />
                      Log out
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
