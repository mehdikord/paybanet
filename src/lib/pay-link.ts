/**
 * Public payment links: /customers/payment/<token>
 * The token is stored in `invoices.pay_link` (UNIQUE) and is generated randomly,
 * never derived from the invoice id, so links cannot be guessed from each other.
 */
export const PAY_LINK_LENGTH = 8;
export const PAY_LINK_REGEX = /^\d{8}$/;

export function payLinkPath(token: string) {
  return `/customers/payment/${token}`;
}
