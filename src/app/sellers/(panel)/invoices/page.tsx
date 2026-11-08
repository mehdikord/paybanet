import type { Metadata } from "next";

import { InvoicesView } from "@/features/invoices/invoices-view";
import { SELF_SCOPE } from "@/features/seller-scope-paths";

export const metadata: Metadata = {
  title: "فاکتورها",
};

export default function InvoicesPage(props: PageProps<"/sellers/invoices">) {
  return (
    <InvoicesView
      scope={SELF_SCOPE}
      title="فاکتورها"
      description="فاکتورهای صادرشده، وضعیت پرداخت و لینک پرداخت هر کدام. مبالغ به تومان است."
      searchParams={props.searchParams}
    />
  );
}
