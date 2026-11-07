"use client";

import { FilterXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUrlParams } from "./use-url-params";

/** Clears the given URL params; hidden when none of them is set. */
export function ResetFiltersButton({ params }: { params: string[] }) {
  const { searchParams, setParams } = useUrlParams();
  if (!params.some((key) => searchParams.has(key))) return null;

  return (
    <Button
      variant="ghost"
      className="h-10 text-muted-foreground"
      onClick={() => setParams(Object.fromEntries(params.map((key) => [key, null])))}
    >
      <FilterXIcon />
      حذف فیلترها
    </Button>
  );
}
