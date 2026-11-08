import "server-only";

import type { NextRequest } from "next/server";

import { listInvoicesForExport, parseInvoiceListParams } from "@/lib/data/invoices";
import { toTehranIsoDay } from "@/lib/dates";
import { buildInvoicesWorkbook } from "@/lib/export/invoices-xlsx";

/**
 * Excel download of every invoice matching the list query (all pages).
 * `sellerId` null = the signed-in seller; otherwise an admin exporting that seller.
 */
export async function invoicesExportResponse(request: NextRequest, sellerId: string | null) {
  const params = parseInvoiceListParams(Object.fromEntries(request.nextUrl.searchParams));
  const { seller, items, total, truncated } = await listInvoicesForExport(params, sellerId);

  const origin = `${request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")}://${
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
  }`;
  const body = await buildInvoicesWorkbook({ sellerName: seller.name, params, items, total, truncated, origin });

  const day = toTehranIsoDay(new Date());
  const suffix = sellerId ? `-seller-${sellerId}` : "";
  const fileName = `invoices${suffix}-${day}.xlsx`;
  const safeName = seller.name.replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 60);
  const persianName = encodeURIComponent(`گزارش-فاکتورها-${safeName}-${day}.xlsx`);
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${persianName}`,
      "Cache-Control": "no-store",
    },
  });
}
