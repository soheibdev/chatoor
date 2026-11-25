"use client";

import Icon from "@/components/ui/Icon";
import type { FieldKey } from "./useAuthForm";
import type { useAuthForm } from "./useAuthForm";

type Form = ReturnType<typeof useAuthForm>;

interface Spec {
  name: FieldKey;
  label: string;
  icon: string;
  type?: string;
  ph?: string;
  ac?: string;
  badge?: string;
  bBg?: string;
  bFg?: string;
  bIcon?: string;
  help?: string;
  pw?: boolean;
}

export function specsFor(reg: boolean, show: boolean): Spec[] {
  const pw: Spec = {
    name: "pw",
    label: "Password",
    icon: "lock",
    type: show ? "text" : "password",
    pw: true,
    ac: reg ? "new-password" : "current-password",
    ph: reg ? "At least 6 characters" : "Your password",
  };
  return reg
    ? [
        { name: "full", label: "Full name", icon: "user", badge: "ADMIN ONLY", bBg: "var(--s2)", bFg: "var(--fg2)", bIcon: "lock", help: "Only organizers see this.", ac: "name", ph: "Yacine Benali" },
        { name: "nick", label: "Nickname", icon: "at-sign", badge: "PUBLIC", bBg: "var(--Gs)", bFg: "var(--Gt)", bIcon: "eye", help: "This is how you appear on the leaderboard.", ph: "yacine_dev" },
        { name: "email", label: "Email", icon: "mail", ac: "email", ph: "you@gdgbatna.com", type: "email" },
        pw,
      ]
    : [{ name: "email", label: "Email", icon: "mail", ac: "email", ph: "you@gdgbatna.com", type: "email" }, pw];
}

/** One field, laid out exactly as the prototype renders `fields`. h50 inputs, r12. */
export default function AuthFields({ form, height = 50 }: { form: Form; height?: number }) {
  const specs = specsFor(form.reg, form.show);

  return (
    <>
      {specs.map((f) => {
        const id = form.pfx + f.name;
        const err = form.touched[f.name] ? form.errs[f.name] : null;
        const focused = form.focus === id;
        const help = f.help || null;
        const isStrength = f.name === "pw" && !!form.strength;
        return (
          <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
              {f.label}
              {f.badge ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    padding: "3px 7px",
                    borderRadius: 6,
                    background: f.bBg,
                    color: f.bFg,
                  }}
                >
                  <Icon n={f.bIcon!} s={11} w={2.5} />
                  {f.badge}
                </span>
              ) : null}
            </label>
            <div
              style={{
                height,
                borderRadius: 12,
                background: "var(--bg)",
                border: `1px solid ${err ? "var(--R)" : focused ? "var(--B)" : "var(--ln2)"}`,
                boxShadow: err ? "0 0 0 3px var(--Rs)" : focused ? "0 0 0 3px var(--Bs)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 5px 0 14px",
                transition: "border-color .12s, box-shadow .12s",
              }}
            >
              <Icon n={f.icon} s={18} style={{ color: err ? "var(--Rt)" : focused ? "var(--Bt)" : "var(--fg3)" }} />
              <input
                id={id}
                name={f.name}
                type={f.type || "text"}
                value={form.value[f.name]}
                onChange={(e) => {
                  form.set[f.name](e.target.value);
                  form.setErr(null);
                }}
                onFocus={() => form.setFocus(id)}
                onBlur={() => {
                  form.setFocus((v) => (v === id ? null : v));
                  form.setTouched((t) => ({ ...t, [f.name]: form.value[f.name] ? 1 : t[f.name] }));
                }}
                placeholder={f.ph}
                autoComplete={f.ac || "off"}
                spellCheck={false}
                aria-invalid={err ? "true" : "false"}
                aria-describedby={err ? `${id}-err` : help ? `${id}-help` : undefined}
                disabled={form.busy}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "var(--fg)",
                  font: "400 15.5px var(--fu)",
                }}
              />
              {f.pw ? (
                <button
                  type="button"
                  onClick={() => form.setShow(!form.show)}
                  aria-label={form.show ? "Hide password" : "Show password"}
                  aria-pressed={form.show}
                  style={{
                    width: 40,
                    height: 40,
                    border: 0,
                    borderRadius: 9,
                    background: "transparent",
                    color: "var(--fg2)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon n={form.show ? "eye-off" : "eye"} s={18} />
                </button>
              ) : null}
            </div>
            {err ? (
              <span
                id={`${id}-err`}
                role="alert"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--Rt)" }}
              >
                <Icon n="circle-alert" s={14} />
                {err}
              </span>
            ) : help ? (
              <span id={`${id}-help`} style={{ fontSize: 12.5, color: "var(--fg3)" }}>
                {help}
              </span>
            ) : null}
            {isStrength ? (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, display: "flex", gap: 4, height: 5 }}>
                  {form.strength!.segs.map((g, i) => (
                    <span key={i} style={{ flex: 1, borderRadius: 3, background: g.c, transition: "background .2s" }} />
                  ))}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: form.strength!.color }}>{form.strength!.label}</span>
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

/** The live player-card preview above the register fields. */
export function PlayerPreview({ form, note = "your player\ncard" }: { form: Form; note?: string }) {
  const COLS = ["var(--B)", "var(--ln2)", "var(--ln2)", "var(--ln2)"];
  return (
    <div
      aria-live="polite"
      style={{
        padding: 12,
        borderRadius: 14,
        background: "var(--bg)",
        border: "1px dashed var(--ln2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          flex: "none",
          width: 44,
          height: 44,
          borderRadius: 13,
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          background: form.preview.bg,
          color: form.preview.fg,
        }}
      >
        {form.preview.ini}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
        <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{form.preview.nick}</b>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--fg3)" }}>
          <span style={{ display: "flex", gap: 2 }}>
            {COLS.map((c, i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />
            ))}
          </span>
          Rookie · 0 pts · unranked
        </span>
      </span>
      <span style={{ fontSize: 11.5, color: "var(--fg3)", textAlign: "end", whiteSpace: "pre-line" }}>{note}</span>
    </div>
  );
}
