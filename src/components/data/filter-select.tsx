"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUrlParams } from "./use-url-params";

export type FilterOption = { value: string; label: string };

/**
 * A select bound to one URL param. The first option is the default
 * (its value is omitted from the URL).
 */
export function FilterSelect({
  param,
  label,
  options,
  className,
}: {
  param: string;
  label: string;
  options: FilterOption[];
  className?: string;
}) {
  const { searchParams, setParams } = useUrlParams();
  const defaultValue = options[0].value;
  const current = searchParams.get(param);
  const value = options.some((o) => o.value === current) ? current! : defaultValue;
  const isActive = value !== defaultValue;

  return (
    <Select
      value={value}
      onValueChange={(next) => setParams({ [param]: next === defaultValue ? null : next })}
    >
      <SelectTrigger
        aria-label={label}
        className={cn("h-10! min-w-36 bg-card", isActive && "border-primary/50 bg-accent text-accent-foreground", className)}
      >
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
