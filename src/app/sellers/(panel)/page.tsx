import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  FileTextIcon,
  PackageIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSeller } from "@/lib/auth/seller";
import { getSellerDashboard } from "@/lib/data/dashboard";
import { formatDate, formatNumber } from "@/lib/format";
import { formatToman } from "@/lib/money";
import { toPersianDigits } from "@/lib/phone";
import { NewInvoiceButton } from "@/features/invoices/invoice-actions";
import { InvoiceStatusBadge } from "@/features/invoices/status-badge";
import { MonthlyChart } from "./_components/monthly-chart";

export const metadata: Metadata = {
  title: "داشبورد",
};

function Toman({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {formatToman(value)} <span className="text-[0.55em] font-medium opacity-70">تومان</span>
    </span>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </>
  );
  const className = "block rounded-2xl border bg-card p-5";
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring outline-none`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

async function Greeting() {
  const seller = await requireSeller();
  return <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">سلام، {seller.name}</h1>;
}

async function Dashboard() {
  const d = await getSellerDashboard();

  if (d.invoices.total === 0) {
    const steps = [
      { done: d.customers > 0, title: "مشتریانتان را ثبت کنید", href: "/sellers/customers", cta: "رفتن به مشتریان" },
      { done: d.products > 0, title: "محصولات و قیمت‌ها را ثبت کنید", href: "/sellers/products", cta: "رفتن به محصولات" },
      { done: false, title: "اولین فاکتور را صادر کنید و لینک پرداخت را بفرستید", href: "/sellers/invoices", cta: "رفتن به فاکتورها" },
    ];
    return (
      <section className="rounded-2xl border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold">شروع کار با پی با نت</h2>
        <p className="mt-1 text-muted-foreground">آمار فروش بعد از صدور اولین فاکتور اینجا نمایش داده می‌شود.</p>
        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-center gap-4 rounded-xl border p-4">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step.done ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {step.done ? <CheckCircle2Icon className="size-4" /> : toPersianDigits(i + 1)}
              </span>
              <span className={`flex-1 ${step.done ? "text-muted-foreground line-through" : "font-medium"}`}>{step.title}</span>
              {!step.done && (
                <Button asChild variant="outline" size="sm">
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              )}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const rate = d.amounts.collectionRate;

  return (
    <div className="space-y-6">
      {/* Money */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#2ec4b0_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <div className="relative">
            <p className="text-sm text-[#a9c2bd]">دریافتی {d.currentMonthName}</p>
            <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              <Toman value={d.amounts.receivedThisMonth} />
            </p>
            <p className="mt-2 text-sm text-[#a9c2bd]">
              {formatNumber(d.invoices.issuedThisMonth)} فاکتور در این ماه صادر شده
            </p>

            <div className="mt-8">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[#a9c2bd]">نرخ وصول کل فاکتورها</span>
                <span className="font-bold tabular-nums">{formatNumber(rate)}٪</span>
              </div>
              <div
                className="mt-2 flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-white/10"
                role="img"
                aria-label={`${formatNumber(rate)} درصد از مبلغ فاکتورها پرداخت شده است`}
              >
                <span className="rounded-full bg-[#2ec4b0]" style={{ width: `${rate}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                <span>
                  <span className="text-[#a9c2bd]">از مجموع </span>
                  <Toman value={d.amounts.total} className="font-semibold" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/sellers/invoices?status=paid"
            className="rounded-2xl border bg-card p-5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2Icon className="size-4" />
              پرداخت‌شده
            </div>
            <p className="mt-2 text-2xl font-extrabold">
              <Toman value={d.amounts.paid} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{formatNumber(d.invoices.paid)} فاکتور</p>
          </Link>
          <Link
            href="/sellers/invoices?status=unpaid"
            className="rounded-2xl border bg-card p-5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <ClockIcon className="size-4" />
              در انتظار پرداخت
            </div>
            <p className="mt-2 text-2xl font-extrabold">
              <Toman value={d.amounts.unpaid} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{formatNumber(d.invoices.unpaid)} فاکتور</p>
          </Link>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={FileTextIcon}
          label="همه فاکتورها"
          value={formatNumber(d.invoices.total)}
          hint={`${formatNumber(d.invoices.paid)} پرداخت‌شده، ${formatNumber(d.invoices.unpaid)} در انتظار`}
          href="/sellers/invoices"
        />
        <StatTile icon={UsersIcon} label="مشتریان" value={formatNumber(d.customers)} href="/sellers/customers" />
        <StatTile icon={PackageIcon} label="محصولات" value={formatNumber(d.products)} href="/sellers/products" />
        <StatTile icon={EyeIcon} label="بازدید لینک‌های پرداخت" value={formatNumber(d.linkViews)} />
      </div>

      {/* Trend + recent */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="chart-title" className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 id="chart-title" className="font-bold">
            مبلغ فاکتورها در ۶ ماه اخیر
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">بر اساس تاریخ فاکتور، به تومان</p>
          <MonthlyChart data={d.monthly} />
        </section>

        <section aria-labelledby="recent-title" className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="font-bold">
              آخرین فاکتورها
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sellers/invoices">
                همه
                <ArrowLeftIcon />
              </Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y">
            {d.recent.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{invoice.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    فاکتور {toPersianDigits(invoice.id)} · {formatDate(invoice.invoiceDate)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums">{formatToman(invoice.total)}</span>
                  <InvoiceStatusBadge paid={invoice.paid} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Suspense fallback={<Skeleton className="h-9 w-56" />}>
            <Greeting />
          </Suspense>
          <p className="mt-2 text-muted-foreground">خلاصه فروش و پرداخت‌های شما. مبالغ به تومان است.</p>
        </div>
        <NewInvoiceButton />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
