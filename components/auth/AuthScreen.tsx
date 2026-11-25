"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/app/AuthContext";
import { handleApiError } from "@/lib/api";
import useIsDesktop from "@/lib/useIsDesktop";
import AuthFields, { PlayerPreview } from "./AuthFields";
import { PERKS_IN, PERKS_UP, useAuthForm } from "./useAuthForm";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

const GATE_NAMES: Record<string, string> = {
  "/challenges": "Challenges",
  "/leaderboard": "the Leaderboard",
};

export default function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const reg = mode === "register";
  const desk = useIsDesktop();
  const router = useRouter();
  const params = useSearchParams();
  const { user, login, register } = useAuth();
  const form = useAuthForm(mode);
  const errRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  const callbackUrl = params.get("callbackUrl") || "/challenges";
  const gate = !reg && GATE_NAMES[callbackUrl] ? GATE_NAMES[callbackUrl] : null;

  // Already-authenticated users are redirected away.
  useEffect(() => {
    if (user && !done) router.replace(callbackUrl);
  }, [user, done, callbackUrl, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.phase !== "idle") return;
    if (form.firstInvalid) {
      form.markAllTouched();
      form.bump();
      form.setErr(null);
      const k = form.firstInvalid;
      setTimeout(() => document.getElementById(form.pfx + k)?.focus(), 30);
      return;
    }
    form.setPhase("loading");
    form.setErr(null);
    try {
      if (reg) {
        await register({
          full_name: form.value.full.trim(),
          nick_name: form.value.nick.trim(),
          email: form.value.email.trim(),
          password: form.value.pw,
        });
        setDone(true);
        form.setPhase("success");
        setTimeout(() => router.replace(callbackUrl), 1500);
      } else {
        await login(form.value.email.trim(), form.value.pw);
        form.setPhase("idle");
        // the redirect effect above takes over once `user` lands
      }
    } catch (err) {
      const e = handleApiError(err);
      form.setPhase("idle");
      form.setErr({ t: e.t, m: e.m });
      form.bump();
      if (reg && e.status === 409) form.setTaken(form.value.nick.trim());
      setTimeout(() => errRef.current?.focus(), 30);
    }
  }

  const perks = (reg ? PERKS_UP : PERKS_IN).map(([icon, t, k]) => ({ icon, t, bg: `var(--${k}s)`, fg: `var(--${k}t)` }));
  const busy = form.busy;

  return (
    <main
      style={{
        position: "relative",
        overflow: "hidden",
        maxWidth: 1160,
        margin: "0 auto",
        padding: desk ? "48px 28px 64px" : "20px 16px 40px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: desk ? "minmax(0,1fr) minmax(0,500px)" : "minmax(0,1fr)",
        gap: 56,
        alignItems: "center",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      {desk ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <span dir="ltr" style={{ fontFamily: "var(--fm)", fontSize: 14, color: "var(--fg3)" }}>
            {reg ? "<register/>" : "<login/>"}
          </span>
          <h1 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 56, lineHeight: 1, letterSpacing: "-.03em" }}>
            {reg ? "Claim your" : "Welcome back,"}
            <br />
            <span style={{ color: reg ? "var(--Yt)" : "var(--Bt)" }}>{reg ? "spot." : "coder."}</span>
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440 }}>
            {perks.map((p) => (
              <div
                key={p.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "var(--s1)",
                  border: "1px solid var(--ln)",
                }}
              >
                <span style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: p.bg, color: p.fg }}>
                  <Icon n={p.icon} s={18} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{p.t}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        style={{
          width: "100%",
          maxWidth: 500,
          justifySelf: "center",
          borderRadius: desk ? 28 : 0,
          background: desk ? "var(--s1)" : "transparent",
          border: desk ? "1px solid var(--ln2)" : 0,
          boxShadow: desk ? "var(--sh)" : "none",
          overflow: "hidden",
          animation: form.shake ? `ymShake${form.shake % 2 ? "A" : "B"} .28s` : "none",
        }}
      >
        {desk ? (
          <div aria-hidden="true" style={{ display: "flex", height: 4 }}>
            {COLS.map((c) => (
              <span key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
        ) : null}

        <div style={{ padding: desk ? 30 : "4px 0", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ flex: "none", width: 58, height: 84, borderRadius: 14, background: "#fff", display: "grid", placeItems: "center" }}>
              <Image src="/assets/gdgc-logo.png" alt="GDGC Univ. Batna 2 logo" width={600} height={917} style={{ height: 68, width: "auto" }} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 26 }}>
                {reg ? "Create account" : "Log in"}
              </h2>
              <div style={{ fontSize: 14.5, color: "var(--fg2)", marginTop: 6 }}>
                {reg ? "Join the GDGC Batna arena." : "Your quests are waiting."}
              </div>
            </div>
          </div>

          {reg && form.phase === "success" ? (
            <div
              role="status"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 14,
                padding: "18px 0 6px",
                animation: "ymIn .3s both",
              }}
            >
              <span
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 28,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 30,
                  background: form.preview.bg,
                  color: form.preview.fg,
                  boxShadow: "0 0 0 6px var(--s1),0 0 0 8px var(--G)",
                  animation: "ymPop .34s cubic-bezier(.34,1.56,.64,1) both",
                }}
              >
                {form.preview.ini}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", color: "var(--Gt)" }}>PLAYER CREATED</span>
              <b style={{ fontFamily: "var(--fd)", fontSize: 24, lineHeight: 1.15 }}>
                Welcome to the arena, @{form.preview.nick}!
              </b>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--fg2)" }}>
                You start as a <b style={{ color: "var(--fg)" }}>Rookie</b>. Solve your first challenge to get on the board.
              </span>
              <span style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--ln)", overflow: "hidden", marginTop: 6 }}>
                <span style={{ display: "block", height: "100%", background: "var(--G)", animation: "ymFill 1.5s linear both" }} />
              </span>
              <span style={{ fontSize: 13, color: "var(--fg3)" }}>Taking you to the challenges…</span>
            </div>
          ) : (
            <>
              {reg ? <PlayerPreview form={form} /> : null}

              {gate ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--Bs)",
                    fontSize: 14,
                  }}
                >
                  <Icon n="lock" s={17} style={{ color: "var(--Bt)" }} />
                  <span>Log in to open {gate}. You’ll land right there after.</span>
                </div>
              ) : null}

              {form.err ? (
                <div
                  id="auth-err"
                  ref={errRef}
                  role="alert"
                  tabIndex={-1}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--Rs)",
                    fontSize: 14,
                    lineHeight: 1.45,
                    outline: 0,
                  }}
                >
                  <Icon n="circle-alert" s={18} style={{ color: "var(--Rt)", marginTop: 1 }} />
                  <span>
                    <b>{form.err.t}</b> {form.err.m}
                  </span>
                </div>
              ) : null}

              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
                <AuthFields form={form} />
                <button
                  type="submit"
                  aria-busy={busy}
                  className="ym-press"
                  style={{
                    marginTop: 4,
                    height: 54,
                    border: 0,
                    borderRadius: 14,
                    background: "var(--btn)",
                    boxShadow: "0 4px 0 var(--btnd)",
                    color: "#fff",
                    font: "700 17px var(--fu)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                    opacity: busy ? 0.85 : 1,
                    ["--base" as string]: "var(--btnd)",
                  }}
                >
                  <span style={{ display: "flex", animation: busy ? "ymSpin .8s linear infinite" : "none" }}>
                    <Icon n={busy ? "loader-circle" : reg ? "rocket" : "log-in"} s={19} />
                  </span>
                  {busy ? (reg ? "Creating your player…" : "Checking…") : reg ? "Start my coding journey" : "Enter the arena"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--fg3)" }}>
                <span style={{ flex: 1, height: 1, background: "var(--ln)" }} />
                {reg ? "Already a member?" : "New here?"}
                <span style={{ flex: 1, height: 1, background: "var(--ln)" }} />
              </div>
              <button
                onClick={() =>
                  router.push(
                    (reg ? "/login" : "/register") +
                      (params.get("callbackUrl") ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""),
                  )
                }
                style={{
                  height: 48,
                  borderRadius: 14,
                  border: "1px solid var(--ln2)",
                  background: "transparent",
                  color: "var(--fg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  font: "700 15px var(--fu)",
                  cursor: "pointer",
                }}
              >
                {reg ? "Log in" : "Create an account"}
                <Icon n="arrow-right" s={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
