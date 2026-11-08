import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomersView } from "@/features/customers/customers-view";
import { adminScope } from "@/features/seller-scope-paths";
import { getManagedSeller } from "../../_components/managed-seller";
import { SellerSectionNav } from "../../_components/seller-section-nav";
import { SellerSectionSkeleton } from "../../_components/seller-section-skeleton";

export const metadata: Metadata = {
  title: "مشتریان فروشنده",
};

async function Content({ params, searchParams }: PageProps<"/admins/sellers/[id]/customers">) {
  const seller = await getManagedSeller(params);
  return (
    <CustomersView
      scope={adminScope(seller.id)}
      nav={<SellerSectionNav seller={seller} current="customers" />}
      title={`مشتریان «${seller.name}»`}
      description="مشتریان این فروشنده. مشتری جدید به فهرست همین فروشنده اضافه می‌شود."
      searchParams={searchParams}
    />
  );
}

export default function AdminSellerCustomersPage(props: PageProps<"/admins/sellers/[id]/customers">) {
  return (
    <Suspense fallback={<SellerSectionSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
