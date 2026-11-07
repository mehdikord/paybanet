"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type ComboboxOption = { id: string; label: string; hint?: string };

type Props<T extends ComboboxOption> = {
  id?: string;
  /** Currently selected option (label shown on the trigger). */
  value: { id: string; label: string } | null;
  onSelect: (option: T) => void;
  /** Server search; called with "" when opened. */
  search: (query: string) => Promise<T[]>;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  invalid?: boolean;
  className?: string;
  /** Render the hint (e.g. phone/code) left-to-right. */
  hintDir?: "ltr" | "rtl";
};

/** Searchable select whose options come from the server. */
export function AsyncCombobox<T extends ComboboxOption>({
  id,
  value,
  onSelect,
  search,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid,
  className,
  hintDir = "ltr",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const runSearch = (q: string) => {
    const current = ++requestId.current;
    setLoading(true);
    search(q)
      .then((result) => {
        if (current === requestId.current) setOptions(result);
      })
      .finally(() => {
        if (current === requestId.current) setLoading(false);
      });
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setQuery("");
          runSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "h-10 w-full justify-between bg-transparent px-3 font-normal aria-invalid:border-destructive",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value?.label ?? placeholder}</span>
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => runSearch(next), 250);
            }}
            placeholder={searchPlaceholder}
          />
          <CommandList>
            {loading && options.length === 0 ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <CheckIcon className={cn("size-4", value?.id === option.id ? "opacity-100" : "opacity-0")} />
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.hint && (
                    <span dir={hintDir} className="text-xs text-muted-foreground tabular-nums">
                      {option.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
