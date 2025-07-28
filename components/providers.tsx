"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { UserProvider } from "@/contexts/user-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error: unknown) => {
          // Global error handling
          console.error("SWR Error:", error);

          // You could also send errors to your error reporting service here
          // Example: Sentry.captureException(error);
        },
        // Global cache settings
        refreshInterval: 0, // Don't auto-refresh unless specified
        fetcher: (url: string) => fetch(url).then((res) => res.json()),
      }}
    >
      <UserProvider>{children}</UserProvider>
    </SWRConfig>
  );
}
