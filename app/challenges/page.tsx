import { Suspense } from "react";
import type { Metadata } from "next";
import ChallengesView from "@/components/game/ChallengesView";

export const metadata: Metadata = { title: "Challenges · CHATOOOR" };

export default function ChallengesPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "60vh" }} />}>
      <ChallengesView />
    </Suspense>
  );
}
