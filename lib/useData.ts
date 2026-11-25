"use client";

import { useQuery } from "@tanstack/react-query";
import * as API from "./api";
import type { Challenge, Player } from "./game";
import {
  sampleAdminSubmissions,
  sampleChallenges,
  sampleParticipants,
  samplePlayers,
  shouldFallback,
} from "./sample";

/** The existing query key and params are preserved: ["challange", type, difficulty, search, page] */
export function useChallenges(params: API.ChallengeParams) {
  const q = useQuery({
    queryKey: ["challange", params.type ?? "", params.difficulty ?? "", params.search ?? "", params.page ?? 1],
    queryFn: async (): Promise<{ items: Challenge[]; totalPages: number }> => {
      try {
        const res = await API.fetchChallenges(params);
        return { items: res.data ?? [], totalPages: res.pagination?.totalPages ?? 1 };
      } catch (err) {
        if (shouldFallback(err)) return { items: sampleChallenges, totalPages: 1 };
        throw err;
      }
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
  return { ...q, data: q.data?.items, pageCount: q.data?.totalPages ?? 1 };
}

/** Admin challenges hook with status filter and counts */
export function useAdminChallenges(params: API.ChallengeParams = {}) {
  const q = useQuery({
    queryKey: ["admin-challenges", params.type ?? "", params.difficulty ?? "", params.status ?? "", params.search ?? "", params.page ?? 1],
    queryFn: async (): Promise<{ items: Challenge[]; totalPages: number; total: number }> => {
      try {
        const res = await API.fetchChallenges(params);
        return {
          items: res.data ?? [],
          totalPages: res.pagination?.totalPages ?? 1,
          total: res.pagination?.total ?? (res.data?.length ?? 0),
        };
      } catch (err) {
        if (shouldFallback(err)) return { items: sampleChallenges, totalPages: 1, total: sampleChallenges.length };
        throw err;
      }
    },
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  });
  return { ...q, data: q.data?.items, total: q.data?.total ?? 0, pageCount: q.data?.totalPages ?? 1 };
}

/** Shared by the leaderboard page and the navbar player card. */
export function useLeaderBoard() {
  return useQuery({
    queryKey: ["leader-board"],
    queryFn: async (): Promise<Player[]> => {
      try {
        return (await API.fetchLeaderBoard()) ?? [];
      } catch (err) {
        if (shouldFallback(err)) return samplePlayers;
        throw err;
      }
    },
    staleTime: 30_000,
  });
}

export function useParticipants() {
  return useQuery({
    queryKey: ["participants"],
    queryFn: async (): Promise<API.Participant[]> => {
      try {
        return (await API.fetchParticipants()) ?? [];
      } catch (err) {
        if (shouldFallback(err)) return sampleParticipants;
        throw err;
      }
    },
    staleTime: 15_000,
  });
}

export function useAdminSubmissions() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async (): Promise<API.AdminSubmission[]> => {
      try {
        return (await API.fetchSubmissions()) ?? [];
      } catch (err) {
        if (shouldFallback(err)) return sampleAdminSubmissions;
        throw err;
      }
    },
    staleTime: 15_000,
  });
}
