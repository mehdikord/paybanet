import type { Metadata } from "next";

import { InvoicePrintView } from "@/features/invoices/print-view";

export const metadata: Metadata = {
  title: "پرینت فاکتور",
};

export default function PrintInvoicePage({ params }: PageProps<"/sellers/invoices/[id]/print">) {
  return <InvoicePrintView invoiceId={params.then((p) => p.id)} sellerId={Promise.resolve(null)} />;
}
