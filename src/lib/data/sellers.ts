/**
 * Seller queries for the admin panel. Every function authorizes the caller.
 * Returned objects are plain and serializable (BIGINT → string).
 */
import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { toLatinDigits } from "@/lib/phone";
import type { Prisma } from "@/generated/prisma/client";

export const SELLERS_PER_PAGE = 15;

export type SellerListItem = {
  id: string;
  name: string;
  phone: string;
  nationalCode: string | null;
  economicCode: string | null;
  createdAt: Date | null;
  counts: { products: number; customers: number; invoices: number };
};

export type SellerDetail = Omit<SellerListItem, "createdAt"> & {
  createdAt: Date | null;
  updatedAt: Date | null;
};

const countsSelect = {
  _count: { select: { products: true, customers: true, invoices: true } },
} satisfies Prisma.SellerSelect;

/** Parses a route param into a seller id, or null if it is not a positive integer. */
export function parseSellerId(value: string): bigint | null {
  return /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : null;
}

export async function listSellers({ query, page }: { query: string; page: number }) {
  await requireAdmin();

  const q = toLatinDigits(query.trim());
  const where: Prisma.SellerWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
          { nationalCode: { contains: q } },
          { economicCode: { contains: q } },
        ],
      }
    : {};

  const total = await db.seller.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / SELLERS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), pageCount);

  const rows = await db.seller.findMany({
    where,
    orderBy: { id: "desc" },
    skip: (currentPage - 1) * SELLERS_PER_PAGE,
    take: SELLERS_PER_PAGE,
    select: {
      id: true,
      name: true,
      phone: true,
      nationalCode: true,
      economicCode: true,
      createdAt: true,
      ...countsSelect,
    },
  });

  const items: SellerListItem[] = rows.map(({ _count, id, ...rest }) => ({
    ...rest,
    id: id.toString(),
    counts: _count,
  }));

  return { items, total, page: currentPage, pageCount };
}

export async function getSeller(id: bigint): Promise<SellerDetail | null> {
  await requireAdmin();

  const seller = await db.seller.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      nationalCode: true,
      economicCode: true,
      createdAt: true,
      updatedAt: true,
      ...countsSelect,
    },
  });
  if (!seller) return null;

  const { _count, id: sellerId, ...rest } = seller;
  return { ...rest, id: sellerId.toString(), counts: _count };
}

export async function countAllSellers() {
  await requireAdmin();
  return db.seller.count();
}
