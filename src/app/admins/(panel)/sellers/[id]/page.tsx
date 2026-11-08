import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader } from "@/components/panel/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeller, parseSellerId } from "@/lib/data/sellers";
import { formatDateTime, formatNumber } from "@/lib/format";
import { updateSeller } from "../actions";
import { SellerDangerZone } from "../_components/seller-danger-zone";
import { SellerForm } from "../_components/seller-form";
import { SellerSectionNav } from "../_components/seller-section-nav";

export const metadata: Metadata = {
  title: "ویرایش فروشنده",
};

async function EditSeller({ params }: PageProps<"/admins/sellers/[id]">) {
  const { id: rawId } = await params;
  const id = parseSellerId(rawId);
  if (!id) notFound();

  const seller = await getSeller(id);
  if (!seller) notFound();

  const stats = [
    { label: "محصول", value: seller.counts.products },
    { label: "مشتری", value: seller.counts.customers },
    { label: "فاکتور", value: seller.counts.invoices },
  ];

  return (
    <>
      <SellerSectionNav seller={seller} current="profile" />
      <PageHeader title={seller.name} description="اطلاعات حساب فروشنده را ویرایش کنید." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <SellerForm
          key={seller.id}
          mode="edit"
          action={updateSeller.bind(null, seller.id)}
          defaultValues={{
            name: seller.name,
            phone: seller.phone,
            nationalCode: seller.nationalCode ?? "",
            economicCode: seller.economicCode ?? "",
            password: "",
            passwordConfirmation: "",
          }}
        />

        <aside className="space-y-6">
          <section aria-labelledby="summary-title" className="rounded-2xl border bg-card p-5">
            <h2 id="summary-title" className="font-bold">
              خلاصه حساب
            </h2>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse rounded-lg bg-muted py-3">
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="text-xl font-bold tabular-nums">{formatNumber(stat.value)}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">تاریخ عضویت</dt>
                <dd>{formatDateTime(seller.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">آخرین ویرایش</dt>
                <dd>{formatDateTime(seller.updatedAt ?? seller.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <SellerDangerZone seller={{ id: seller.id, name: seller.name, counts: seller.counts }} />
        </aside>
      </div>
    </>
  );
}

function EditSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Skeleton className="h-[560px] rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </>
  );
}

export default function EditSellerPage(props: PageProps<"/admins/sellers/[id]">) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Suspense fallback={<EditSkeleton />}>
        <EditSeller {...props} />
      </Suspense>
    </div>
  );
}
