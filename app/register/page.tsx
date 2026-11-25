import { Suspense } from "react";
import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = { title: "Create account · CHATOOOR" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "calc(100vh - 72px)" }} />}>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
