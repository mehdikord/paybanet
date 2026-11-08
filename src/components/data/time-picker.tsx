"use client";

import { ClockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { nowTehranTime } from "@/lib/dates";
import { toPersianDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));
const MINUTES = Array.from({ length: 60 }, (_, m) => pad(m));

/** 24h time picker (Tehran wall clock). Value/onChange use "HH:MM". */
export function TimePicker({
  id,
  value,
  onChange,
  invalid,
  className,
}: {
  id?: string;
  value: string;
  onChange: (time: string) => void;
  invalid?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const pickHour = (h: string) => onChange(`${h}:${minute || "00"}`);
  const pickMinute = (m: string) => onChange(`${hour || "00"}:${m}`);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn(
            "h-10 justify-start gap-2 bg-transparent px-3 font-normal tabular-nums aria-invalid:border-destructive",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <ClockIcon className="text-muted-foreground" />
          {value ? toPersianDigits(value) : "انتخاب ساعت"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* LTR so hours sit on the left and minutes on the right, like a clock "HH:MM". */}
        <div dir="ltr" className="flex divide-x">
          <TimeColumn
            label="ساعت"
            options={HOURS}
            selected={hour}
            onPick={pickHour}
          />
          <TimeColumn
            label="دقیقه"
            options={MINUTES}
            selected={minute}
            onPick={pickMinute}
          />
        </div>
        <div className="flex justify-between gap-2 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(nowTehranTime());
              setOpen(false);
            }}
          >
            اکنون
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            تأیید
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimeColumn({
  label,
  options,
  selected,
  onPick,
}: {
  label: string;
  options: string[];
  selected: string;
  onPick: (option: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Bring the selected value into view when the popover opens.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="flex w-20 flex-col">
      <p dir="rtl" className="border-b py-1.5 text-center text-xs text-muted-foreground">
        {label}
      </p>
      <div ref={listRef} role="listbox" aria-label={label} className="h-56 overflow-y-auto overscroll-contain p-1">
        {options.map((option) => {
          const active = option === selected;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onPick(option)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                "hover:bg-muted",
                active && "bg-primary font-semibold text-primary-foreground hover:bg-primary",
              )}
            >
              {toPersianDigits(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
