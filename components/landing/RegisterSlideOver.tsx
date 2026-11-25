"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import AuthFields, { PlayerPreview } from "@/components/auth/AuthFields";
import { useAuthForm } from "@/components/auth/useAuthForm";
import { useAuth } from "@/app/AuthContext";
import { handleApiError } from "@/lib/api";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

/**
 * Screens 1 L3 / L4 — "Join the arena".
 * ≥768px a 500px slide-over from the inline end, <768px a bottom sheet.
 * Linkable through ?join=1.
 */
export default function RegisterSlideOver({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { register } = useAuth();
  const form = useAuthForm("register");
  const [sheet, setSheet] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const errRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const read = () => setSheet(window.innerWidth < 768);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  // Focus trap + Esc, focus returns to the trigger via onClose.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const first = node?.querySelector<HTMLElement>("input") ?? node?.querySelector<HTMLElement>("button, a[href]");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && form.phase !== "loading") onClose();
      if (e.key !== "Tab" || !node) return;
      const els = Array.from(
        node.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && i === els.length - 1) {
        e.preventDefault();
        els[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose, form.phase]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.phase !== "idle") return;
    if (form.firstInvalid) {
      form.markAllTouched();
      form.bump();
      form.setErr(null);
      setTimeout(() => document.getElementById(form.pfx + form.firstInvalid!)?.focus(), 30);
      return;
    }
    form.setPhase("loading");
    try {
      await register({
        full_name: form.value.full.trim(),
        nick_name: form.value.nick.trim(),
        email: form.value.email.trim(),
        password: form.value.pw,
      });
      form.setPhase("success");
      setTimeout(() => router.push("/challenges"), 1500);
    } catch (err) {
      const e2 = handleApiError(err);
      form.setPhase("idle");
      form.setErr({ t: e2.t, m: e2.m });
      form.bump();
      if (e2.status === 409) form.setTaken(form.value.nick.trim());
      setTimeout(() => errRef.current?.focus(), 30);
    }
  }

  const busy = form.busy;
  const success = form.phase === "success";

  return (
    <div
      onClick={() => {
        if (!busy) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(5,4,10,.66)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: sheet ? "flex-end" : "stretch",
        justifyContent: "flex-end",
      }}
    >
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: sheet ? "100%" : 500,
          maxWidth: "100%",
          height: sheet ? "calc(100% - 56px)" : "100%",
          background: "var(--s1)",
          borderLeft: sheet ? 0 : "1px solid var(--ln2)",
          borderTop: sheet ? "1px solid var(--ln2)" : 0,
          borderRadius: sheet ? "24px 24px 0 0" : 0,
          boxShadow: "var(--sh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: sheet ? "ymIn .26s cubic-bezier(.16,1,.3,1)" : "ymSlideIn .3s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div aria-hidden="true" style={{ display: "flex", height: 4 }}>
          {COLS.map((c) => (
            <span key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>

        {success ? (
          <div
            role="status"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "12px 20px 28px",
              gap: 18,
              overflow: "hidden",
            }}
          >
            {sheet ? <span style={{ width: 40, height: 5, borderRadius: 3, background: "var(--ln2)" }} /> : null}
            <div style={{ position: "relative", marginTop: 56, width: 150, height: 150, display: "grid", placeItems: "center" }}>
              <span style={{ position: "absolute", left: 8, top: 22, width: 12, height: 12, borderRadius: 3, background: "var(--B)", transform: "rotate(20deg)" }} />
              <span style={{ position: "absolute", right: 4, top: 10, width: 10, height: 10, borderRadius: "50%", background: "var(--R)" }} />
              <span style={{ position: "absolute", right: 14, bottom: 20, width: 14, height: 6, borderRadius: 3, background: "var(--G)", transform: "rotate(-30deg)" }} />
              <span style={{ position: "absolute", left: 18, bottom: 8, width: 9, height: 9, borderRadius: "50%", background: "var(--Y)" }} />
              <span style={{ position: "absolute", left: 62, top: 0, width: 8, height: 8, borderRadius: 2, background: "var(--Y)", transform: "rotate(45deg)" }} />
              <span
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 28,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--fd)",
                  fontWeight: 800,
                  fontSize: 32,
                  background: form.preview.bg,
                  color: form.preview.fg,
                  boxShadow: "0 0 0 6px var(--s1),0 0 0 8px var(--G)",
                  animation: "ymPop .34s cubic-bezier(.34,1.56,.64,1) both",
                }}
              >
                {form.preview.ini}
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--Gt)" }}>
              Player created
            </span>
            <h2 style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 28, lineHeight: 1.1 }}>
              Welcome to the arena, @{form.preview.nick}!
            </h2>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5, color: "var(--fg2)" }}>
              You start as a <b style={{ color: "var(--fg)" }}>Rookie</b>. Solve your first challenge to get on the board.
            </p>
            <div style={{ width: "100%", marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 6, borderRadius: 3, background: "var(--ln)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--G)", animation: "ymFill 1.5s linear both" }} />
              </div>
              <span style={{ fontSize: 13, color: "var(--fg3)" }}>Taking you to the challenges…</span>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", display: "grid", placeItems: "center", flex: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/gdgc-mark.png" alt="GDGC" style={{ width: 31, height: "auto" }} />
              </span>
              <div style={{ flex: 1 }}>
                <h2 id="reg-title" style={{ margin: 0, fontFamily: "var(--fd)", fontWeight: 800, fontSize: 26 }}>
                  Join the arena
                </h2>
                <div style={{ fontSize: 14.5, color: "var(--fg2)", marginTop: 6 }}>Create your player profile. Takes 30 seconds.</div>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1px solid var(--ln)",
                  background: "transparent",
                  color: "var(--fg2)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Icon n="x" s={18} />
              </button>
            </div>

            <div style={{ margin: "20px 28px 0" }}>
              <PlayerPreview form={form} note={"live preview\nof your card"} />
            </div>

            {form.err ? (
              <div
                ref={errRef}
                role="alert"
                tabIndex={-1}
                style={{
                  margin: "16px 28px 0",
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

            <form
              id="reg-slideover-form"
              onSubmit={onSubmit}
              noValidate
              style={{
                padding: "20px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                flex: 1,
                overflow: "auto",
                animation: form.shake ? `ymShake${form.shake % 2 ? "A" : "B"} .28s` : "none",
              }}
            >
              <AuthFields form={form} height={48} />
            </form>

            <div style={{ padding: "20px 28px 28px", borderTop: "1px solid var(--ln)", display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                type="submit"
                form="reg-slideover-form"
                aria-busy={busy}
                className="ym-press"
                style={{
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
                  <Icon n={busy ? "loader-circle" : "rocket"} s={19} />
                </span>
                {busy ? "Creating your player…" : "Start my coding journey"}
              </button>
              <span style={{ textAlign: "center", fontSize: 14, color: "var(--fg2)" }}>
                Already a member?{" "}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    router.push("/login");
                  }}
                  style={{ color: "var(--Bt)", fontWeight: 700 }}
                >
                  Log in
                </a>
              </span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
