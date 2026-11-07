"use client";

import { ThemeProvider } from "next-themes";

import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <DirectionProvider dir="rtl">
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-center" dir="rtl" richColors closeButton />
        </TooltipProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
