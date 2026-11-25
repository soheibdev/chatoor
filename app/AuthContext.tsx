"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as API from "@/lib/api";
import type { MeUser } from "@/lib/api";
import { shouldFallback } from "@/lib/sample";

const LOCAL_SESSION = "ym:session";

interface AuthValue {
  user: MeUser | null;
  loading: boolean;
  /** true when the session is a local review session (backend unreachable) */
  offline: boolean;
  fetchUser: () => Promise<MeUser | null>;
  login: (email: string, password: string) => Promise<MeUser>;
  register: (body: { full_name: string; nick_name: string; email: string; password: string }) => Promise<MeUser>;
  logout: () => Promise<void>;
  setUser: (u: MeUser | null) => void;
}

const Ctx = createContext<AuthValue | null>(null);

function readLocal(): MeUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION);
    return raw ? (JSON.parse(raw) as MeUser) : null;
  } catch {
    return null;
  }
}

function writeLocal(u: MeUser | null) {
  try {
    if (u) window.localStorage.setItem(LOCAL_SESSION, JSON.stringify(u));
    else window.localStorage.removeItem(LOCAL_SESSION);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const u = await API.fetchMe();
      setUser(u);
      setOffline(false);
      return u;
    } catch (err) {
      if (shouldFallback(err)) {
        const local = readLocal();
        setOffline(true);
        setUser(local);
        return local;
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await API.login(email, password);
        const u = await API.fetchMe();
        setUser(u);
        setOffline(false);
        return u;
      } catch (err) {
        if (shouldFallback(err)) {
          // Local review session: the backend is unreachable, so keep the screens usable.
          const u: MeUser = { id: "me", email, nick_name: "yacine_dev", role: "participant" };
          writeLocal(u);
          setUser(u);
          setOffline(true);
          return u;
        }
        throw err;
      }
    },
    [],
  );

  const register = useCallback(
    async (body: { full_name: string; nick_name: string; email: string; password: string }) => {
      try {
        await API.registerParticipant(body);
        await API.login(body.email, body.password);
        const u = await API.fetchMe();
        setUser(u);
        setOffline(false);
        return u;
      } catch (err) {
        if (shouldFallback(err)) {
          const u: MeUser = {
            id: "me",
            email: body.email,
            nick_name: body.nick_name,
            full_name: body.full_name,
            role: "participant",
          };
          writeLocal(u);
          setUser(u);
          setOffline(true);
          return u;
        }
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await API.logoutRequest();
    } catch {
      /* the cookie may already be gone */
    }
    writeLocal(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, loading, offline, fetchUser, login, register, logout, setUser }),
    [user, loading, offline, fetchUser, login, register, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
