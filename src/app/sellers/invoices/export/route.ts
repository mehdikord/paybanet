import type { NextRequest } from "next/server";

import { invoicesExportResponse } from "@/features/invoices/export-response";

/**
 * GET /sellers/invoices/export?<same query as the invoices list>
 * Downloads every invoice of the signed-in seller matching the filters (all pages) as .xlsx.
 */
export function GET(request: NextRequest) {
  return invoicesExportResponse(request, null);
}
