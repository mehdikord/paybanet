"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isoDayToPickerDate, pickedDateToIsoDay, todayIsoDay } from "@/lib/dates";
import { formatJalaliDay } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Jalali date picker. Value/onChange use Gregorian "YYYY-MM-DD". */
export function DatePicker({
  id,
  value,
  onChange,
  invalid,
  disableFuture,
  className,
}: {
  id?: string;
  value: string;
  onChange: (isoDay: string) => void;
  invalid?: boolean;
  /** Days after today (Tehran) cannot be picked. */
  disableFuture?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? isoDayToPickerDate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn(
            "h-10 w-full justify-start gap-2 bg-transparent px-3 font-normal aria-invalid:border-destructive",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {value ? formatJalaliDay(value) : "انتخاب تاریخ"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disableFuture ? { after: isoDayToPickerDate(todayIsoDay()) } : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(pickedDateToIsoDay(date));
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(2015, 0)}
          endMonth={disableFuture ? isoDayToPickerDate(todayIsoDay()) : new Date(new Date().getFullYear() + 2, 11)}
          autoFocus
        />
        <div className="flex justify-between border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(todayIsoDay());
              setOpen(false);
            }}
          >
            امروز
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
