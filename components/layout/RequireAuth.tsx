"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/app/AuthContext";

/**
 * Route protection: as a guest, Challenges and the Leaderboard route through /login
 * with a callbackUrl so you land right there after.
 */
export default function RequireAuth({ gate, children }: { gate: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?callbackUrl=${encodeURIComponent(gate)}`);
  }, [loading, user, gate, router]);

  if (loading || !user) return <Splash />;
  return <>{children}</>;
}

/** Loader / splash: white mark tile + four hopping dots + "Loading the arena…" */
export function Splash() {
  const cols = ["var(--B)", "var(--R)", "var(--Y)", "var(--G)"];
  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      <span style={{ width: 80, height: 80, borderRadius: 24, background: "#fff", display: "grid", placeItems: "center" }}>
        <Image src="/assets/gdgc-mark.png" alt="" width={1360} height={719} style={{ width: 58, height: "auto" }} />
      </span>
      <span style={{ display: "flex", gap: 8 }}>
        {cols.map((c, i) => (
          <span
            key={c}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: c,
              animation: `ymDot 1s ${i * 120}ms infinite`,
            }}
          />
        ))}
      </span>
      <span style={{ fontSize: 14.5, color: "var(--fg2)" }}>Loading the arena…</span>
    </main>
  );
}
