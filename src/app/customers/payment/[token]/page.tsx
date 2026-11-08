import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPublicInvoice } from "@/lib/data/invoices";
import { todayIsoDay } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { toPersianDigits } from "@/lib/phone";
import { PaymentView } from "./payment-view";

export const metadata: Metadata = {
  title: "پرداخت فاکتور",
  referrer: "no-referrer",
};

function InvalidLink() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <LinkIcon className="size-7" />
      </span>
      <h1 className="mt-4 text-xl font-bold">این لینک پرداخت معتبر نیست</h1>
      <p className="mt-2 max-w-xs leading-7 text-muted-foreground">
        ممکن است فاکتور حذف شده باشد یا لینک ناقص کپی شده باشد. لینک درست را از فروشنده بخواهید.
      </p>
    </main>
  );
}

async function Payment({ params }: PageProps<"/customers/payment/[token]">) {
  // Always render per request: payment status is live, and "today" (the default
  // payment day) must be the visitor's current Tehran day, never a prerendered one.
  await connection();
  const { token } = await params;
  const invoice = await getPublicInvoice(token);
  if (!invoice) return <InvalidLink />;

  return (
    <PaymentView
      invoice={{
        token,
        number: toPersianDigits(invoice.id),
        date: formatDate(invoice.invoiceDate),
        sellerName: invoice.seller.name,
        customerName: invoice.customer.name,
        total: invoice.total,
        paid: invoice.paid,
        paidDate: invoice.paidAt ? formatDate(invoice.paidAt) : null,
        today: todayIsoDay(),
        items: invoice.items.map(({ name, quantity, price, lineTotal }) => ({ name, quantity, price, lineTotal })),
      }}
    />
  );
}

function PaymentSkeleton() {
  return (
    <main className="min-h-svh">
      <div className="h-64 bg-ink" />
      <div className="mx-auto -mt-20 max-w-md space-y-3 px-4">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </main>
  );
}

export default function PaymentPage(props: PageProps<"/customers/payment/[token]">) {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <Payment {...props} />
    </Suspense>
  );
}
