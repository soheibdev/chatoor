/**
 * API client. The contract is frozen: endpoints, payload shapes, field names, the
 * cookie auth flow, track keys (ps|ctf|ai) and statuses (pending|accepted|rejected)
 * are exactly those documented in FRONTEND_DEEP_ANALYSIS_REPORT.md §6.
 *
 * When the backend cannot be reached (offline review of this build), the hooks in
 * lib/useData.ts fall back to the design's sample content so every screen renders.
 */
import axios from "axios";
import type { Challenge, Player } from "./game";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://apidevchallenge.gdgbatna.com/";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

export interface MeUser {
  id: string;
  email: string;
  nick_name?: string;
  full_name?: string;
  role?: string;
}

/* ---------------- auth ---------------- */

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiEnvelope<MeUser>>("/auth/login", { email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<ApiEnvelope<MeUser>>("/auth/me");
  return data.data;
}

export async function logoutRequest() {
  const { data } = await api.post<ApiEnvelope<unknown>>("/auth/logout", {});
  return data;
}

export async function registerParticipant(body: {
  full_name: string;
  nick_name: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post<ApiEnvelope<MeUser>>("/participants", body);
  return data;
}

/* ---------------- participants (admin) ---------------- */

export interface Participant {
  id: string;
  points: number;
  nick_name: string;
  email: string;
  full_name: string;
}

export async function fetchParticipants() {
  const { data } = await api.get<ApiEnvelope<Participant[]>>("/participants");
  return data.data;
}

export async function updateParticipantPoints(userID: string, points: number) {
  const { data } = await api.put<ApiEnvelope<unknown>>("/participants", { userID, points });
  return data;
}

/* ---------------- challenges ---------------- */

export interface ChallengeParams {
  type?: string;
  difficulty?: string;
  search?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  limit?: number;
}

export interface CreateChallengeInput {
  title: string;
  subTitle?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  type: string;
  difficulty: string;
  points: number;
  flag?: string;
  flagHash?: string;
  isActive?: boolean;
}

export interface EditChallengeInput {
  title?: string;
  subTitle?: string;
  subtitle?: string;
  description?: string;
  link?: string;
  type?: string;
  difficulty?: string;
  points?: number;
  flag?: string;
  flagHash?: string;
  isActive?: boolean;
}

export async function fetchChallenges(params: ChallengeParams = {}) {
  const { data } = await api.get<ApiEnvelope<Challenge[]>>("/challenges", { params });
  return data;
}

export async function fetchChallengeById(id: string) {
  const { data } = await api.get<ApiEnvelope<Challenge>>(`/challenges/${id}`);
  return data.data;
}

export async function createChallenge(body: CreateChallengeInput) {
  const { data } = await api.post<ApiEnvelope<Challenge>>("/challenges", body);
  return data;
}

export async function updateChallenge(id: string, body: EditChallengeInput) {
  const { data } = await api.put<ApiEnvelope<Challenge>>(`/challenges/${id}`, body);
  return data;
}

export async function deleteChallenge(id: string) {
  const { data } = await api.delete<ApiEnvelope<{ deleted: boolean; deactivated?: boolean; message?: string }>>(`/challenges/${id}`);
  return data;
}

/** CTF sends { challengeID, flag }. PS and AI send { challengeID, link }. */
export async function postSubmission(body: { challengeID: string; link?: string; flag?: string }) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/submissions", body);
  return data;
}

/* ---------------- submissions (admin) ---------------- */

export interface AdminSubmission {
  id: string;
  challengeID?: string;
  status: "pending" | "accepted" | "rejected";
  points?: number;
  link?: string | null;
  flag?: string | null;
  created_at?: string;
  user?: { id: string; nick_name?: string; email?: string; full_name?: string };
  challenge?: Challenge;
}

export async function fetchSubmissions() {
  const { data } = await api.get<ApiEnvelope<AdminSubmission[]>>("/submissions");
  return data.data;
}

export async function updateSubmission(body: {
  SubmissionID: string;
  status?: string;
  link?: string | null;
  points?: number;
}) {
  const { data } = await api.put<ApiEnvelope<unknown>>("/submissions", body);
  return data;
}

/* ---------------- leaderboard ---------------- */

export async function fetchLeaderBoard() {
  const { data } = await api.get<ApiEnvelope<Player[]>>("/leader-board");
  return data.data;
}

/* ---------------- errors ---------------- */

/** Maps axios failures onto the copy the design shows. 409 reads "conflict", not "onflict". */
export function handleApiError(err: unknown): { t: string; m: string; status?: number } {
  const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  const status = e?.response?.status;
  const server = e?.response?.data?.message;
  if (status === 400) return { t: "Check your details.", m: server || "Something in the form isn’t right.", status };
  if (status === 401) return { t: "Wrong email or password.", m: "Check both and try again.", status };
  if (status === 403) return { t: "Not allowed.", m: server || "Your account can’t do that.", status };
  if (status === 404) return { t: "Not found.", m: server || "That resource no longer exists.", status };
  if (status === 409) return { t: "Nickname already taken.", m: "Pick another one and try again.", status };
  if (status && status >= 500) return { t: "The server stumbled.", m: "Try again in a moment.", status };
  return { t: "Couldn’t reach the arena.", m: server || "Check your connection and try again.", status };
}
