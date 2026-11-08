import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { SellerScopeProvider } from "@/features/seller-scope";
import type { SellerScope } from "@/features/seller-scope-paths";
import { parseCustomerListParams } from "@/lib/data/customers";
import type { RawSearchParams } from "@/lib/data/list-params";
import { NewCustomerButton } from "./customer-actions";
import { CustomersTable } from "./customers-table";
import { CustomersToolbar } from "./customers-toolbar";

async function Results({ searchParams, scope }: { searchParams: Promise<RawSearchParams>; scope: SellerScope }) {
  const params = parseCustomerListParams(await searchParams);
  return <CustomersTable params={params} scope={scope} />;
}

/** Customers management screen, shared by the seller panel and the admin panel. */
export function CustomersView({
  scope,
  title,
  description,
  nav,
  searchParams,
}: {
  scope: SellerScope;
  title: React.ReactNode;
  description: React.ReactNode;
  /** Optional row above the header (e.g. the admin's seller sections). */
  nav?: React.ReactNode;
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <SellerScopeProvider scope={scope}>
      <div className="mx-auto max-w-6xl space-y-6">
        {nav}
        <PageHeader title={title} description={description} actions={<NewCustomerButton />} />

        <Suspense fallback={<div className="h-10" />}>
          <CustomersToolbar />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <Results searchParams={searchParams} scope={scope} />
        </Suspense>
      </div>
    </SellerScopeProvider>
  );
}
