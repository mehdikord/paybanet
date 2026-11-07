"use client";

import { endOfMonth, startOfMonth, subDays, subMonths } from "date-fns-jalali";
import { CalendarRangeIcon, XIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isoDayToPickerDate, pickedDateToIsoDay, todayIsoDay } from "@/lib/dates";
import { formatJalaliDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUrlParams } from "./use-url-params";

type Preset = { label: string; range: () => [Date, Date] };

/** Jalali presets (month boundaries follow the Persian calendar). */
const presets: Preset[] = [
  { label: "امروز", range: () => [new Date(), new Date()] },
  { label: "۷ روز اخیر", range: () => [subDays(new Date(), 6), new Date()] },
  { label: "۳۰ روز اخیر", range: () => [subDays(new Date(), 29), new Date()] },
  { label: "این ماه", range: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
  {
    label: "ماه قبل",
    range: () => {
      const last = subMonths(new Date(), 1);
      return [startOfMonth(last), endOfMonth(last)];
    },
  },
];

/** Date range bound to `?from=` / `?to=` (Gregorian "YYYY-MM-DD"), picked on a Jalali calendar. */
export function DateRangeFilter({ label = "تاریخ" }: { label?: string }) {
  const { searchParams, setParams } = useUrlParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const active = !!(from || to);
  const summary = active
    ? from && to
      ? from === to
        ? formatJalaliDay(from)
        : `${formatJalaliDay(from)} تا ${formatJalaliDay(to)}`
      : from
        ? `از ${formatJalaliDay(from)}`
        : `تا ${formatJalaliDay(to!)}`
    : "همه تاریخ‌ها";

  const apply = (range: DateRange | undefined) => {
    setParams({
      from: range?.from ? pickedDateToIsoDay(range.from) : null,
      to: range?.to ? pickedDateToIsoDay(range.to) : range?.from ? pickedDateToIsoDay(range.from) : null,
    });
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(
            from || to
              ? {
                  from: from ? isoDayToPickerDate(from) : undefined,
                  to: to ? isoDayToPickerDate(to) : undefined,
                }
              : undefined,
          );
        }
      }}
    >
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-10 justify-start gap-2 bg-card font-normal",
              active && "border-primary/50 bg-accent pe-9 text-accent-foreground",
            )}
          >
            <CalendarRangeIcon className="text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="max-w-56 truncate">{summary}</span>
          </Button>
        </PopoverTrigger>
        {active && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="حذف فیلتر تاریخ"
            className="absolute end-2 top-1/2 -translate-y-1/2"
            onClick={() => setParams({ from: null, to: null })}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-wrap gap-1 border-b p-2 sm:w-32 sm:flex-col sm:border-e sm:border-b-0">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  const [start, end] = preset.range();
                  apply({ from: start, to: end });
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div>
            <Calendar
              mode="range"
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from ?? isoDayToPickerDate(todayIsoDay())}
              numberOfMonths={1}
              autoFocus
            />
            <div className="flex items-center justify-between gap-2 border-t p-2">
              <p className="text-xs text-muted-foreground">
                {draft?.from ? "روز پایان را انتخاب کنید." : "روز شروع را انتخاب کنید."}
              </p>
              <Button size="sm" disabled={!draft?.from} onClick={() => apply(draft)}>
                اعمال
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
