import { Suspense } from "react";
import Landing from "@/components/landing/Landing";

export default function HomePage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh" }} />}>
      <Landing />
    </Suspense>
  );
}
