import type { Metadata } from "next";

import { CustomersView } from "@/features/customers/customers-view";
import { SELF_SCOPE } from "@/features/seller-scope-paths";

export const metadata: Metadata = {
  title: "مشتریان",
};

export default function CustomersPage(props: PageProps<"/sellers/customers">) {
  return (
    <CustomersView
      scope={SELF_SCOPE}
      title="مشتریان"
      description="مشتریانی که برایشان فاکتور و لینک پرداخت صادر می‌کنید."
      searchParams={props.searchParams}
    />
  );
}
