import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductsView } from "@/features/products/products-view";
import { adminScope } from "@/features/seller-scope-paths";
import { getManagedSeller } from "../../_components/managed-seller";
import { SellerSectionNav } from "../../_components/seller-section-nav";
import { SellerSectionSkeleton } from "../../_components/seller-section-skeleton";

export const metadata: Metadata = {
  title: "محصولات فروشنده",
};

async function Content({ params, searchParams }: PageProps<"/admins/sellers/[id]/products">) {
  const seller = await getManagedSeller(params);
  return (
    <ProductsView
      scope={adminScope(seller.id)}
      nav={<SellerSectionNav seller={seller} current="products" />}
      title={`محصولات «${seller.name}»`}
      description="کالاها و خدمات این فروشنده. محصول جدید به فهرست همین فروشنده اضافه می‌شود. قیمت‌ها به تومان است."
      searchParams={searchParams}
    />
  );
}

export default function AdminSellerProductsPage(props: PageProps<"/admins/sellers/[id]/products">) {
  return (
    <Suspense fallback={<SellerSectionSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
