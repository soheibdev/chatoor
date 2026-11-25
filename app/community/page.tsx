import type { Metadata } from "next";
import CommunityView from "@/components/pages/CommunityView";

export const metadata: Metadata = { title: "Community · CHATOOOR" };

export default function CommunityPage() {
  return <CommunityView />;
}
