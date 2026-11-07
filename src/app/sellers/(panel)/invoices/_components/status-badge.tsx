import { CheckIcon, ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function InvoiceStatusBadge({ paid, className }: { paid: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        paid
          ? "bg-primary/10 text-primary dark:bg-primary/15"
          : "bg-amber-500/12 text-amber-800 dark:text-amber-300",
        className,
      )}
    >
      {paid ? <CheckIcon className="size-3" /> : <ClockIcon className="size-3" />}
      {paid ? "پرداخت‌شده" : "در انتظار پرداخت"}
    </span>
  );
}
