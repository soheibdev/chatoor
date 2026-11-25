"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { useAuth } from "@/app/AuthContext";
import { DEMO_FALLBACK } from "@/lib/sample";

const COLS = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];

/**
 * Two global system states from Screens 6:
 *  · the 2px four-colour progress line under the navbar while queries refetch
 *  · the 401 alert dialog "Your session ended", which returns to the same page
 */
export default function SessionWatch() {
  const fetching = useIsFetching();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        // In review mode a 401 is expected (no backend session) and is handled by the fallback.
        if (status === 401 && user && !DEMO_FALLBACK) setExpired(true);
        return Promise.reject(err);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [user]);

  return (
    <>
      {fetching > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 72,
            left: 0,
            right: 0,
            display: "flex",
            height: 2,
            zIndex: 19,
            pointerEvents: "none",
          }}
        >
          {COLS.map((c) => (
            <span key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
      ) : null}

      {expired ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(5,4,10,.72)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 16 }}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sx-t"
            style={{
              width: "min(420px, calc(100vw - 32px))",
              borderRadius: 22,
              background: "var(--s1)",
              border: "1px solid var(--ln2)",
              boxShadow: "var(--sh)",
              padding: 28,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 12,
              animation: "ymIn .2s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <span style={{ width: 52, height: 52, borderRadius: 15, display: "grid", placeItems: "center", background: "var(--Ys)", color: "var(--Yt)" }}>
              <Icon n="lock" s={24} />
            </span>
            <b id="sx-t" style={{ fontSize: 18 }}>
              Your session ended
            </b>
            <span style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--fg2)" }}>
              Log in again to pick up where you left off. We’ll bring you back to this page.
            </span>
            <button
              autoFocus
              onClick={() => {
                setExpired(false);
                setUser(null);
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
              }}
              className="ym-press"
              style={{
                marginTop: 6,
                width: "100%",
                height: 46,
                border: 0,
                borderRadius: 12,
                background: "var(--btn)",
                boxShadow: "0 3px 0 var(--btnd)",
                color: "#fff",
                font: "700 15px var(--fu)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                ["--base" as string]: "var(--btnd)",
              }}
            >
              <Icon n="log-in" s={16} />
              Log in again
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
