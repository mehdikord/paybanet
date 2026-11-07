"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Last-resort error screen (unexpected server/render errors). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-7" />
      </span>
      <h1 className="mt-4 text-xl font-bold">مشکلی پیش آمد</h1>
      <p className="mt-2 max-w-sm leading-7 text-muted-foreground">
        درخواست انجام نشد. دوباره تلاش کنید؛ اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
      </p>
      {error.digest && (
        <p dir="ltr" className="mt-2 font-mono text-xs text-muted-foreground">
          ref: {error.digest}
        </p>
      )}
      <Button className="mt-6" onClick={reset}>
        <RotateCcwIcon />
        تلاش دوباره
      </Button>
    </main>
  );
}
