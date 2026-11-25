import type { Metadata } from "next";
import ResourcesView from "@/components/pages/ResourcesView";

export const metadata: Metadata = { title: "Resources · CHATOOOR" };

export default function ResourcesPage() {
  return <ResourcesView />;
}
