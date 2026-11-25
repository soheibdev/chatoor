import { Suspense } from "react";
import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = { title: "Log in · CHATOOOR" };

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "calc(100vh - 72px)" }} />}>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
