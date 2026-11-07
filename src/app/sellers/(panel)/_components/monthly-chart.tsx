"use client";

import { useState } from "react";

import type { MonthlyPoint } from "@/lib/data/dashboard";
import { formatToman } from "@/lib/money";

const compact = new Intl.NumberFormat("fa-IR", { notation: "compact", maximumFractionDigits: 1 });

/** Rounds the axis maximum up to a "nice" value (1, 2, 2.5, 5 × 10ⁿ). */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

const CHART_HEIGHT = 200;

/** Stacked monthly bars: paid (bottom) + unpaid (top), by invoice date. */
export function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const totals = data.map((d) => Number(d.paid) + Number(d.unpaid));
  const max = niceMax(Math.max(...totals));
  const ticks = [max, max / 2, 0];
  const hasData = totals.some((t) => t > 0);
  const activePoint = active === null ? null : data[active];

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="راهنمای نمودار">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-chart-paid" aria-hidden="true" />
          پرداخت‌شده
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-chart-unpaid" aria-hidden="true" />
          در انتظار پرداخت
        </li>
      </ul>

      <div className="relative flex gap-3">
        {/* Y axis */}
        <div
          className="flex shrink-0 flex-col justify-between text-[11px] text-muted-foreground tabular-nums"
          style={{ height: CHART_HEIGHT }}
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {compact.format(t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Recessive grid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: CHART_HEIGHT }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="border-t border-dashed border-border" />
            ))}
          </div>

          <ol className="relative flex items-end justify-around gap-2" style={{ height: CHART_HEIGHT }}>
            {data.map((point, index) => {
              const paid = Number(point.paid);
              const unpaid = Number(point.unpaid);
              const paidH = (paid / max) * CHART_HEIGHT;
              const unpaidH = (unpaid / max) * CHART_HEIGHT;
              const label = `${point.label}: پرداخت‌شده ${formatToman(point.paid)} تومان، در انتظار ${formatToman(point.unpaid)} تومان`;
              return (
                <li key={point.key} className="flex h-full w-full max-w-14 justify-center">
                  <button
                    type="button"
                    aria-label={label}
                    className="group flex h-full w-full flex-col justify-end rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onMouseEnter={() => setActive(index)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                  >
                    <span className="mx-auto flex w-full max-w-9 flex-col justify-end gap-[2px]">
                      {unpaid > 0 && (
                        <span
                          className="block rounded-t-[4px] bg-chart-unpaid transition-opacity group-hover:opacity-85"
                          style={{ height: Math.max(unpaidH, 3) }}
                        />
                      )}
                      {paid > 0 && (
                        <span
                          className={`block bg-chart-paid transition-opacity group-hover:opacity-85 ${unpaid > 0 ? "" : "rounded-t-[4px]"}`}
                          style={{ height: Math.max(paidH, 3) }}
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <ol className="mt-2 flex justify-around gap-2 text-xs text-muted-foreground" aria-hidden="true">
            {data.map((point, index) => (
              <li key={point.key} className={`w-full max-w-14 text-center ${active === index ? "font-semibold text-foreground" : ""}`}>
                {point.label}
              </li>
            ))}
          </ol>

          {activePoint && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 w-52 rounded-lg border bg-popover p-3 text-sm shadow-lg"
              style={{
                insetInlineStart: `calc(${((active! + 0.5) / data.length) * 100}% - 104px)`,
              }}
            >
              <p className="mb-2 font-semibold">{activePoint.label}</p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-paid" />
                  پرداخت‌شده
                </span>
                <span className="font-semibold tabular-nums">{formatToman(activePoint.paid)}</span>
              </p>
              <p className="mt-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-unpaid" />
                  در انتظار
                </span>
                <span className="font-semibold tabular-nums">{formatToman(activePoint.unpaid)}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">مبالغ به تومان</p>
            </div>
          )}

          {!hasData && (
            <p className="absolute inset-x-0 top-1/3 text-center text-sm text-muted-foreground">
              در این شش ماه فاکتوری ثبت نشده است.
            </p>
          )}
        </div>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">نمایش جدول داده‌ها</summary>
        <table className="mt-2 w-full text-start">
          <thead className="text-muted-foreground">
            <tr className="[&>th]:py-1 [&>th]:text-start [&>th]:font-medium">
              <th>ماه</th>
              <th>پرداخت‌شده (تومان)</th>
              <th>در انتظار (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.key} className="border-t [&>td]:py-1.5 [&>td]:tabular-nums">
                <td>{point.label}</td>
                <td>{formatToman(point.paid)}</td>
                <td>{formatToman(point.unpaid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
