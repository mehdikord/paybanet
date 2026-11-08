import type { Metadata } from "next";

import { InvoicePrintView } from "@/features/invoices/print-view";

export const metadata: Metadata = {
  title: "پرینت فاکتور",
};

/** Admin: print one invoice of a seller. Authorization happens in `resolveSellerId`. */
export default function AdminPrintInvoicePage({ params }: PageProps<"/admins/sellers/[id]/invoices/[invoiceId]/print">) {
  return <InvoicePrintView invoiceId={params.then((p) => p.invoiceId)} sellerId={params.then((p) => p.id)} />;
}
