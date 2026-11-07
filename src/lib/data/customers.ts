/**
 * Customer queries for the seller panel. Always scoped to the signed-in seller.
 */
import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { requireSellerId } from "@/lib/auth/seller";
import { db } from "@/lib/db";
import { toLatinDigits } from "@/lib/phone";
import { getEnum, getPage, getString, paginate, type RawSearchParams } from "./list-params";

export const CUSTOMERS_PER_PAGE = 15;

export const CUSTOMER_SORTS = ["newest", "oldest", "name", "invoices"] as const;
export const CUSTOMER_ECONOMIC_FILTERS = ["all", "with", "without"] as const;
export const CUSTOMER_INVOICE_FILTERS = ["all", "with", "without"] as const;

export type CustomerListParams = {
  q: string;
  sort: (typeof CUSTOMER_SORTS)[number];
  economic: (typeof CUSTOMER_ECONOMIC_FILTERS)[number];
  invoices: (typeof CUSTOMER_INVOICE_FILTERS)[number];
  page: number;
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string;
  economicCode: string | null;
  description: string | null;
  createdAt: Date | null;
  invoiceCount: number;
};

export function parseCustomerListParams(params: RawSearchParams): CustomerListParams {
  return {
    q: getString(params, "q"),
    sort: getEnum(params, "sort", CUSTOMER_SORTS),
    economic: getEnum(params, "economic", CUSTOMER_ECONOMIC_FILTERS),
    invoices: getEnum(params, "invoices", CUSTOMER_INVOICE_FILTERS),
    page: getPage(params),
  };
}

const orderBy: Record<CustomerListParams["sort"], Prisma.CustomerOrderByWithRelationInput[]> = {
  newest: [{ id: "desc" }],
  oldest: [{ id: "asc" }],
  name: [{ name: "asc" }, { id: "desc" }],
  invoices: [{ invoices: { _count: "desc" } }, { id: "desc" }],
};

export async function listCustomers(params: CustomerListParams) {
  const sellerId = await requireSellerId();
  const q = toLatinDigits(params.q);

  const where: Prisma.CustomerWhereInput = {
    sellerId,
    ...(q && {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { economicCode: { contains: q } },
        { description: { contains: q } },
      ],
    }),
    ...(params.economic === "with" && { economicCode: { not: null } }),
    ...(params.economic === "without" && { economicCode: null }),
    ...(params.invoices === "with" && { invoices: { some: {} } }),
    ...(params.invoices === "without" && { invoices: { none: {} } }),
  };

  const [total, sellerTotal] = await Promise.all([
    db.customer.count({ where }),
    db.customer.count({ where: { sellerId } }),
  ]);
  const { page, pageCount, skip, take } = paginate(total, params.page, CUSTOMERS_PER_PAGE);

  const rows = await db.customer.findMany({
    where,
    orderBy: orderBy[params.sort],
    skip,
    take,
    select: {
      id: true,
      name: true,
      phone: true,
      economicCode: true,
      description: true,
      createdAt: true,
      _count: { select: { invoices: true } },
    },
  });

  const items: CustomerListItem[] = rows.map(({ id, _count, ...rest }) => ({
    ...rest,
    id: id.toString(),
    invoiceCount: _count.invoices,
  }));

  return { items, total, sellerTotal, page, pageCount };
}
