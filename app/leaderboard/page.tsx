import type { Metadata } from "next";
import LeaderboardView from "@/components/game/LeaderboardView";

export const metadata: Metadata = { title: "Leaderboard · CHATOOOR" };

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
