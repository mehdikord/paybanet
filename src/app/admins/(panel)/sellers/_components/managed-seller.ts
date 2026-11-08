import "server-only";

import { notFound } from "next/navigation";

import { getSeller, parseSellerId } from "@/lib/data/sellers";

/** The seller from a `/admins/sellers/[id]/…` route, or 404. Requires an admin. */
export async function getManagedSeller(params: Promise<{ id: string }>) {
  const id = parseSellerId((await params).id);
  if (!id) notFound();
  const seller = await getSeller(id);
  if (!seller) notFound();
  return seller;
}
