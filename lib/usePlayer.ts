"use client";

import { useAuth } from "@/app/AuthContext";
import { useLeaderBoard } from "./useData";
import { hue, initials, rank as rankOf, tierFor, type Player } from "./game";

/**
 * Player identity for the navbar: /auth/me gives id/nickname/email, points and rank come
 * from GET /leader-board matched on user.id, sharing one React Query key with the
 * leaderboard page. While loading, the points chip is replaced by a shimmer.
 */
export function usePlayer() {
  const { user } = useAuth();
  const { data: board, isLoading } = useLeaderBoard();
  const players: Player[] = board ?? [];
  const nick = user?.nick_name || user?.email?.split("@")[0] || "player";
  const mine = user ? players.find((p) => p.id === user.id) : undefined;
  const points = mine?.points ?? 0;
  const R = user ? rankOf(players, user.id) : null;
  const found = !!mine;
  const h = hue(nick);

  return {
    user,
    players,
    nick,
    email: user?.email ?? "",
    points,
    rank: found && R ? R.rank : players.length + 1,
    ranked: found,
    above: found && R ? R.above : null,
    gap: found && R ? R.gap : 0,
    sorted: R ? R.sorted : [...players].sort((a, b) => b.points - a.points),
    tier: tierFor(points),
    ini: initials(nick),
    avBg: `var(--${h}s)`,
    avFg: `var(--${h}t)`,
    loading: isLoading,
  };
}
