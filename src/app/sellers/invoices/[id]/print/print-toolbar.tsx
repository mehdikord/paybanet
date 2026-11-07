"use client";

import { PrinterIcon, XIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Screen-only toolbar; opens the print dialog once fonts are ready. */
export function PrintToolbar({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur print:hidden">
      <p className="text-sm text-muted-foreground">پیش‌نمایش چاپ — اندازه A4</p>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => window.close()}>
          <XIcon />
          بستن
        </Button>
        <Button onClick={() => window.print()}>
          <PrinterIcon />
          پرینت
        </Button>
      </div>
    </div>
  );
}
