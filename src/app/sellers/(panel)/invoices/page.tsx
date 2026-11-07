import type { Metadata } from "next";
import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { parseInvoiceListParams } from "@/lib/data/invoices";
import { NewInvoiceButton } from "./_components/invoice-actions";
import { InvoicesTable } from "./_components/invoices-table";
import { InvoicesToolbar } from "./_components/invoices-toolbar";

export const metadata: Metadata = {
  title: "فاکتورها",
};

async function Results({ searchParams }: PageProps<"/sellers/invoices">) {
  const params = parseInvoiceListParams(await searchParams);
  return <InvoicesTable params={params} />;
}

export default function InvoicesPage(props: PageProps<"/sellers/invoices">) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="فاکتورها"
        description="فاکتورهای صادرشده، وضعیت پرداخت و لینک پرداخت هر کدام. مبالغ به تومان است."
        actions={<NewInvoiceButton />}
      />

      <Suspense fallback={<div className="h-24" />}>
        <InvoicesToolbar />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}
