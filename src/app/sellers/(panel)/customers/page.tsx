import type { Metadata } from "next";
import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { parseCustomerListParams } from "@/lib/data/customers";
import { NewCustomerButton } from "./_components/customer-actions";
import { CustomersTable } from "./_components/customers-table";
import { CustomersToolbar } from "./_components/customers-toolbar";

export const metadata: Metadata = {
  title: "مشتریان",
};

async function Results({ searchParams }: PageProps<"/sellers/customers">) {
  const params = parseCustomerListParams(await searchParams);
  return <CustomersTable params={params} />;
}

export default function CustomersPage(props: PageProps<"/sellers/customers">) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="مشتریان"
        description="مشتریانی که برایشان فاکتور و لینک پرداخت صادر می‌کنید."
        actions={<NewCustomerButton />}
      />

      <Suspense fallback={<div className="h-10" />}>
        <CustomersToolbar />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}
