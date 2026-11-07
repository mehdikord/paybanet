import type { Metadata } from "next";

import { PageHeader } from "@/components/panel/page-header";
import { createSeller } from "../actions";
import { SellerForm } from "../_components/seller-form";

export const metadata: Metadata = {
  title: "فروشنده جدید",
};

export default function NewSellerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="فروشنده جدید"
        description="پس از ساخت، فروشنده با همین شماره موبایل و رمز عبور وارد پنل خودش می‌شود."
      />
      <SellerForm mode="create" action={createSeller} />
    </div>
  );
}
