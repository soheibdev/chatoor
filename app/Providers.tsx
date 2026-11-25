"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import useIsDesktop from "@/lib/useIsDesktop";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );
  const desk = useIsDesktop();

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        {/* Desktop: top-center, 84px from the top. Mobile: bottom-center, 84px from the bottom. */}
        <Toaster
          position={desk ? "top-center" : "bottom-center"}
          containerStyle={desk ? { top: 84 } : { bottom: 84 }}
          gutter={10}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
