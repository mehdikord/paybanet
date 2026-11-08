import type { NextRequest } from "next/server";

import { invoicesExportResponse } from "@/features/invoices/export-response";

/**
 * GET /admins/sellers/<id>/invoices/export?<same query as the invoices list>
 * Admin: downloads every invoice of that seller matching the filters (all pages) as .xlsx.
 * Authorization happens in `resolveSellerId` (admin session required).
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/admins/sellers/[id]/invoices/export">) {
  const { id } = await params;
  return invoicesExportResponse(request, id);
}
