"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { getQueryClient } from "@/lib/query/client";

// Filter out the React 19 false-positive warning for next-themes inline script tag in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={350} skipDelayDuration={150}>
          {children}
          <Toaster closeButton position="bottom-right" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
