/**
 * Product queries for the seller panel. Scoped to the signed-in seller, or to
 * the seller an admin is managing when `sellerId` is passed.
 */
import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { resolveSellerId } from "@/lib/auth/seller-scope";
import { db } from "@/lib/db";
import { rialToToman, tomanToRial } from "@/lib/money";
import { toLatinDigits } from "@/lib/phone";
import {
  getEnum,
  getNonNegativeInt,
  getPage,
  getString,
  paginate,
  type RawSearchParams,
} from "./list-params";

export const PRODUCTS_PER_PAGE = 15;

export const PRODUCT_SORTS = ["newest", "oldest", "name", "price_asc", "price_desc"] as const;
export const PRODUCT_USAGE_FILTERS = ["all", "used", "unused"] as const;

export type ProductListParams = {
  q: string;
  sort: (typeof PRODUCT_SORTS)[number];
  usage: (typeof PRODUCT_USAGE_FILTERS)[number];
  /** Toman. */
  minPrice: number | null;
  /** Toman. */
  maxPrice: number | null;
  page: number;
};

export type ProductListItem = {
  id: string;
  name: string;
  code: string;
  /** Toman, as a string (BIGINT is not serializable). */
  price: string;
  description: string | null;
  createdAt: Date | null;
  orderCount: number;
};

export function parseProductListParams(params: RawSearchParams): ProductListParams {
  return {
    q: getString(params, "q"),
    sort: getEnum(params, "sort", PRODUCT_SORTS),
    usage: getEnum(params, "usage", PRODUCT_USAGE_FILTERS),
    minPrice: getNonNegativeInt(params, "min"),
    maxPrice: getNonNegativeInt(params, "max"),
    page: getPage(params),
  };
}

const orderBy: Record<ProductListParams["sort"], Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ id: "desc" }],
  oldest: [{ id: "asc" }],
  name: [{ name: "asc" }, { id: "desc" }],
  price_asc: [{ price: "asc" }, { id: "desc" }],
  price_desc: [{ price: "desc" }, { id: "desc" }],
};

export async function listProducts(params: ProductListParams, scopeSellerId?: string | null) {
  const sellerId = await resolveSellerId(scopeSellerId);
  const q = toLatinDigits(params.q);

  const price: Prisma.BigIntFilter = {};
  if (params.minPrice !== null) price.gte = tomanToRial(params.minPrice);
  if (params.maxPrice !== null) price.lte = tomanToRial(params.maxPrice);

  const where: Prisma.ProductWhereInput = {
    sellerId,
    ...(q && {
      OR: [{ name: { contains: q } }, { code: { contains: q } }, { description: { contains: q } }],
    }),
    ...(Object.keys(price).length > 0 && { price }),
    ...(params.usage === "used" && { orders: { some: {} } }),
    ...(params.usage === "unused" && { orders: { none: {} } }),
  };

  const [total, sellerTotal] = await Promise.all([
    db.product.count({ where }),
    db.product.count({ where: { sellerId } }),
  ]);
  const { page, pageCount, skip, take } = paginate(total, params.page, PRODUCTS_PER_PAGE);

  const rows = await db.product.findMany({
    where,
    orderBy: orderBy[params.sort],
    skip,
    take,
    select: {
      id: true,
      name: true,
      code: true,
      price: true,
      description: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const items: ProductListItem[] = rows.map(({ id, price: rial, _count, ...rest }) => ({
    ...rest,
    id: id.toString(),
    price: rialToToman(rial).toString(),
    orderCount: _count.orders,
  }));

  return { items, total, sellerTotal, page, pageCount };
}
