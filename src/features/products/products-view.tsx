import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { SellerScopeProvider } from "@/features/seller-scope";
import type { SellerScope } from "@/features/seller-scope-paths";
import { parseProductListParams } from "@/lib/data/products";
import type { RawSearchParams } from "@/lib/data/list-params";
import { NewProductButton } from "./product-actions";
import { ProductsTable } from "./products-table";
import { ProductsToolbar } from "./products-toolbar";

async function Results({ searchParams, scope }: { searchParams: Promise<RawSearchParams>; scope: SellerScope }) {
  const params = parseProductListParams(await searchParams);
  return <ProductsTable params={params} scope={scope} />;
}

/** Products management screen, shared by the seller panel and the admin panel. */
export function ProductsView({
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
        <PageHeader title={title} description={description} actions={<NewProductButton />} />

        <Suspense fallback={<div className="h-10" />}>
          <ProductsToolbar />
        </Suspense>

        <Suspense fallback={<ListSkeleton />}>
          <Results searchParams={searchParams} scope={scope} />
        </Suspense>
      </div>
    </SellerScopeProvider>
  );
}
