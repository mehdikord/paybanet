import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { SellerScopeProvider } from "@/features/seller-scope";
import type { SellerScope } from "@/features/seller-scope-paths";
import { parseInvoiceListParams } from "@/lib/data/invoices";
import type { RawSearchParams } from "@/lib/data/list-params";
import { ExportInvoicesButton, ExportInvoicesButtonFallback } from "./export-invoices-button";
import { NewInvoiceButton } from "./invoice-actions";
import { InvoicesTable } from "./invoices-table";
import { InvoicesToolbar } from "./invoices-toolbar";

async function Results({ searchParams, scope }: { searchParams: Promise<RawSearchParams>; scope: SellerScope }) {
  const params = parseInvoiceListParams(await searchParams);
  return <InvoicesTable params={params} scope={scope} />;
}

/** Invoice management screen, shared by the seller panel and the admin panel. */
export function InvoicesView({
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
        <PageHeader
          title={title}
          description={description}
          actions={
            <>
              <Suspense fallback={<ExportInvoicesButtonFallback />}>
                <ExportInvoicesButton />
              </Suspense>
              <NewInvoiceButton />
            </>
          }
        />

        <Suspense fallback={<div className="h-24" />}>
          <InvoicesToolbar />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <Results searchParams={searchParams} scope={scope} />
        </Suspense>
      </div>
    </SellerScopeProvider>
  );
}
