import { cn } from "@/lib/utils";

/** Receipt-shaped mark: a slip with a torn edge and a check line. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-ink" />
      <path
        d="M10 7.5h12a1.5 1.5 0 0 1 1.5 1.5v15.5l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4V9A1.5 1.5 0 0 1 10 7.5Z"
        fill="#2ec4b0"
      />
      <path
        d="m12.4 15.6 2.5 2.4 4.9-5"
        fill="none"
        stroke="#0f2a2e"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("text-lg font-extrabold tracking-tight", wordmarkClassName)}>
        پی با نت
      </span>
    </span>
  );
}
