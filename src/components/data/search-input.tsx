"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useUrlParams } from "./use-url-params";

/** Search box synced to `?q=` (debounced). */
export function SearchInput({ placeholder, label }: { placeholder: string; label: string }) {
  const { searchParams, setParams, isPending } = useUrlParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams({ q: next.trim() }), 350);
  };

  return (
    <div role="search" className="w-full sm:max-w-xs">
      <InputGroup className="h-10 bg-card">
        <InputGroupInput
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <InputGroupAddon>{isPending ? <Spinner /> : <SearchIcon />}</InputGroupAddon>
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="پاک کردن جستجو"
              onClick={() => {
                clearTimeout(timer.current);
                setValue("");
                setParams({ q: null });
              }}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}
