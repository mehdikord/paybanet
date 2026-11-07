import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { InvoicePrintDocument } from "@/components/invoice/invoice-print-document";
import { getInvoiceDocument } from "@/lib/data/invoices";
import { PrintToolbar } from "./print-toolbar";

export const metadata: Metadata = {
  title: "پرینت فاکتور",
};

async function PrintableInvoice({ params }: PageProps<"/sellers/invoices/[id]/print">) {
  const { id } = await params;
  if (!/^[1-9]\d{0,18}$/.test(id)) notFound();

  const invoice = await getInvoiceDocument(BigInt(id));
  if (!invoice) notFound();

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <>
      <PrintToolbar autoPrint />
      <div className="py-8 print:py-0">
        <InvoicePrintDocument invoice={invoice} origin={origin} />
      </div>
    </>
  );
}

export default function PrintInvoicePage(props: PageProps<"/sellers/invoices/[id]/print">) {
  return (
    <main className="min-h-svh bg-muted print:bg-white">
      <Suspense fallback={<p className="p-8 text-center text-muted-foreground">در حال آماده‌سازی فاکتور…</p>}>
        <PrintableInvoice {...props} />
      </Suspense>
    </main>
  );
}
