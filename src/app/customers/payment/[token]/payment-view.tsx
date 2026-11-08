"use client";

import { CheckCircle2Icon, LockKeyholeIcon, ShieldCheckIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { LogoMark } from "@/components/brand/logo";
import { DatePicker } from "@/components/data/date-picker";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatToman } from "@/lib/money";
import { numberToPersianWords } from "@/lib/persian-words";
import { toPersianDigits } from "@/lib/phone";
import { payInvoice, recordPaymentView } from "./actions";

export type PaymentInvoice = {
  token: string;
  number: string;
  /** Jalali date, already formatted on the server (no time). */
  date: string;
  sellerName: string;
  customerName: string;
  total: string;
  paid: boolean;
  /** Jalali date of payment, formatted on the server. */
  paidDate: string | null;
  /** Today in Tehran ("YYYY-MM-DD"), the default payment day. */
  today: string;
  items: { name: string; quantity: number; price: string; lineTotal: string }[];
};

const paidDateFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tehran",
});

export function PaymentView({ invoice }: { invoice: PaymentInvoice }) {
  const [paid, setPaid] = useState(invoice.paid);
  const [paidDate, setPaidDate] = useState(invoice.paidDate);
  const [justPaid, setJustPaid] = useState(false);
  const [paidDay, setPaidDay] = useState(invoice.today);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const viewRecorded = useRef(false);

  // One view per page open (guarded against effect re-runs).
  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    void recordPaymentView(invoice.token);
  }, [invoice.token]);

  const pay = () =>
    startTransition(async () => {
      setError(undefined);
      const result = await payInvoice(invoice.token, paidDay);
      if (!result.ok) {
        setError(result.message ?? "پرداخت انجام نشد. دوباره تلاش کنید.");
        return;
      }
      setPaid(true);
      setJustPaid(true);
      if (result.paidAt) setPaidDate(paidDateFormat.format(new Date(result.paidAt)));
    });

  return (
    <main className="min-h-svh bg-background">
      {/* Amount band */}
      <section className="relative overflow-hidden bg-ink px-4 pt-8 pb-28 text-white sm:pt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#2ec4b0_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative mx-auto max-w-md">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9 ring-1 ring-white/15 rounded-[9px]" />
            <div className="min-w-0">
              <p className="truncate font-bold">{invoice.sellerName}</p>
              <p className="text-xs text-[#a9c2bd]">فاکتور شماره {invoice.number}</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-[#a9c2bd]">{paid ? "مبلغ پرداخت‌شده" : "مبلغ قابل پرداخت"}</p>
          <p className="mt-1 text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
            {formatToman(invoice.total)}
            <span className="ms-2 text-lg font-medium text-[#a9c2bd]">تومان</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-[#a9c2bd]">{numberToPersianWords(invoice.total)} تومان</p>
        </div>
      </section>

      {/* Receipt */}
      <div className="relative mx-auto -mt-20 max-w-md px-4 pb-56 sm:pb-12">
        <article
          aria-label="جزئیات فاکتور"
          className="slip-edge relative rounded-t-2xl bg-card px-5 pt-6 pb-10 shadow-[0_24px_50px_-24px_rgb(15_42_46/0.45)] ring-1 ring-border"
        >
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">صورتحساب برای</dt>
              <dd className="mt-0.5 font-semibold">{invoice.customerName}</dd>
            </div>
            <div className="text-end">
              <dt className="text-muted-foreground">تاریخ فاکتور</dt>
              <dd className="mt-0.5 font-semibold">{invoice.date}</dd>
            </div>
          </dl>

          <div className="my-5 border-t border-dashed" />

          <ul className="space-y-3.5 text-sm">
            {invoice.items.map((item, index) => (
              <li key={index} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {toPersianDigits(item.quantity)} × {formatToman(item.price)} تومان
                  </p>
                </div>
                <span className="shrink-0 font-semibold tabular-nums">{formatToman(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="my-5 border-t border-dashed" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold">جمع کل</span>
            <span className="text-xl font-extrabold tabular-nums">
              {formatToman(invoice.total)} <span className="text-sm font-medium text-muted-foreground">تومان</span>
            </span>
          </div>

        </article>

        {/* Outside the article: its torn-edge mask would clip the stamp. */}
        {paid && (
          <div
            className={`absolute -top-6 left-2 rounded-xl border-[3px] border-saffron bg-card/90 px-4 py-1.5 text-lg font-black text-saffron ${justPaid ? "animate-stamp-in [animation-delay:0ms]" : "-rotate-12"}`}
          >
            پرداخت شد
          </div>
        )}

        {/* Pay / status */}
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="mx-auto max-w-md space-y-3">
            {paid ? (
              <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-accent-foreground" role="status">
                <CheckCircle2Icon className="size-6 shrink-0 text-primary" />
                <div>
                  <p className="font-bold">{justPaid ? "پرداخت با موفقیت انجام شد." : "این فاکتور پرداخت شده است."}</p>
                  {paidDate && <p className="text-sm opacity-80">تاریخ پرداخت: {paidDate}</p>}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="paid-day" className="shrink-0 text-sm font-medium">
                    تاریخ پرداخت
                  </label>
                  <DatePicker
                    id="paid-day"
                    value={paidDay}
                    onChange={setPaidDay}
                    disableFuture
                    className="w-auto min-w-44"
                  />
                </div>
                {error && (
                  <p role="alert" className="text-center text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button size="lg" className="h-14 w-full text-lg font-bold" onClick={pay} disabled={isPending}>
                  {isPending ? <Spinner /> : <LockKeyholeIcon />}
                  {isPending ? "در حال پرداخت…" : `پرداخت ${formatToman(invoice.total)} تومان`}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheckIcon className="size-3.5" />
                  حالت آزمایشی: پرداخت بدون اتصال به درگاه بانکی ثبت می‌شود.
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 hidden text-center text-xs text-muted-foreground sm:block">
          این صفحه با پی با نت ساخته شده است.
        </p>
      </div>
    </main>
  );
}
