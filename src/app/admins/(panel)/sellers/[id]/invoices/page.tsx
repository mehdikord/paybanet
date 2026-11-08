import type { Metadata } from "next";
import { Suspense } from "react";

import { InvoicesView } from "@/features/invoices/invoices-view";
import { adminScope } from "@/features/seller-scope-paths";
import { getManagedSeller } from "../../_components/managed-seller";
import { SellerSectionNav } from "../../_components/seller-section-nav";
import { SellerSectionSkeleton } from "../../_components/seller-section-skeleton";

export const metadata: Metadata = {
  title: "فاکتورهای فروشنده",
};

async function Content({ params, searchParams }: PageProps<"/admins/sellers/[id]/invoices">) {
  const seller = await getManagedSeller(params);
  return (
    <InvoicesView
      scope={adminScope(seller.id)}
      nav={<SellerSectionNav seller={seller} current="invoices" />}
      title={`فاکتورهای «${seller.name}»`}
      description="فاکتورهای این فروشنده، وضعیت پرداخت و لینک پرداخت هر کدام. فاکتور جدید به نام همین فروشنده صادر می‌شود. مبالغ به تومان است."
      searchParams={searchParams}
    />
  );
}

export default function AdminSellerInvoicesPage(props: PageProps<"/admins/sellers/[id]/invoices">) {
  return (
    <Suspense fallback={<SellerSectionSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}
