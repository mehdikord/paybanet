"use client";

import { useEffect, useRef, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { digitsOnly, formatAmountInput } from "@/lib/money";
import { useUrlParams } from "./use-url-params";

/** Min/max amount (Toman) bound to `?min=` and `?max=` (debounced, written together). */
export function AmountRangeFilter({ label = "مبلغ" }: { label?: string }) {
  const { searchParams, setParams } = useUrlParams();
  const [min, setMin] = useState(formatAmountInput(searchParams.get("min") ?? ""));
  const [max, setMax] = useState(formatAmountInput(searchParams.get("max") ?? ""));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the inputs in sync when filters are cleared elsewhere.
  const urlMin = searchParams.get("min") ?? "";
  const urlMax = searchParams.get("max") ?? "";
  const [synced, setSynced] = useState({ urlMin, urlMax });
  if (synced.urlMin !== urlMin || synced.urlMax !== urlMax) {
    setSynced({ urlMin, urlMax });
    if (digitsOnly(min) !== urlMin) setMin(formatAmountInput(urlMin));
    if (digitsOnly(max) !== urlMax) setMax(formatAmountInput(urlMax));
  }

  // Both bounds are written together, so typing in one field quickly after
  // the other never drops the first value.
  const update = (key: "min" | "max", raw: string) => {
    const formatted = formatAmountInput(raw);
    const next = { min, max, [key]: formatted };
    if (key === "min") setMin(formatted);
    else setMax(formatted);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => setParams({ min: digitsOnly(next.min), max: digitsOnly(next.max) }),
      500,
    );
  };

  const input = (key: "min" | "max", value: string, prefix: string) => (
    <InputGroup className="h-10 w-full bg-card sm:w-40">
      <InputGroupAddon>
        <InputGroupText>{prefix}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        dir="ltr"
        inputMode="numeric"
        value={value}
        onChange={(e) => update(key, e.target.value)}
        placeholder="—"
        aria-label={`${label} ${prefix} (تومان)`}
        className="text-left tabular-nums"
      />
    </InputGroup>
  );

  return (
    <div className="flex items-center gap-2" role="group" aria-label={`بازه ${label} به تومان`}>
      {input("min", min, "از")}
      {input("max", max, "تا")}
    </div>
  );
}
