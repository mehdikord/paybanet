import type { Metadata } from "next";
import { Suspense } from "react";

import { ListSkeleton } from "@/components/data/list-skeleton";
import { PageHeader } from "@/components/panel/page-header";
import { parseProductListParams } from "@/lib/data/products";
import { NewProductButton } from "./_components/product-actions";
import { ProductsTable } from "./_components/products-table";
import { ProductsToolbar } from "./_components/products-toolbar";

export const metadata: Metadata = {
  title: "محصولات",
};

async function Results({ searchParams }: PageProps<"/sellers/products">) {
  const params = parseProductListParams(await searchParams);
  return <ProductsTable params={params} />;
}

export default function ProductsPage(props: PageProps<"/sellers/products">) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="محصولات"
        description="کالاها و خدماتی که در فاکتورهایتان می‌فروشید. قیمت‌ها به تومان است."
        actions={<NewProductButton />}
      />

      <Suspense fallback={<div className="h-10" />}>
        <ProductsToolbar />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <Results {...props} />
      </Suspense>
    </div>
  );
}
