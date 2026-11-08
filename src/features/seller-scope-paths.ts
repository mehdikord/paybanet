/** Scope + URL helpers shared by server and client code (no React here). */

export type SellerScope = {
  /** `null` = the signed-in seller; otherwise the seller an admin is managing. */
  sellerId: string | null;
  /** "/sellers" or "/admins/sellers/<id>". */
  basePath: string;
};

export const SELF_SCOPE: SellerScope = { sellerId: null, basePath: "/sellers" };

export const adminScope = (sellerId: string): SellerScope => ({
  sellerId,
  basePath: `/admins/sellers/${sellerId}`,
});

export const isAdminScope = (scope: SellerScope) => scope.sellerId !== null;

export const scopePaths = (scope: SellerScope) => ({
  invoices: `${scope.basePath}/invoices`,
  products: `${scope.basePath}/products`,
  customers: `${scope.basePath}/customers`,
  invoiceExport: `${scope.basePath}/invoices/export`,
  invoicePrint: (invoiceId: string) => `${scope.basePath}/invoices/${invoiceId}/print`,
});
