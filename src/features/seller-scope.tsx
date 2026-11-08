"use client";

/**
 * Which seller the shared invoice / product / customer screens work on.
 * Seller panel: `sellerId: null` (the signed-in seller), base path "/sellers".
 * Admin panel:  the managed seller's id, base path "/admins/sellers/<id>".
 * Server actions receive `sellerId` and authorize it (see `resolveSellerId`).
 */
import { createContext, useContext } from "react";

import type { SellerScope } from "./seller-scope-paths";

const SellerScopeContext = createContext<SellerScope>({ sellerId: null, basePath: "/sellers" });

export function SellerScopeProvider({ scope, children }: { scope: SellerScope; children: React.ReactNode }) {
  return <SellerScopeContext value={scope}>{children}</SellerScopeContext>;
}

export const useSellerScope = () => useContext(SellerScopeContext);
