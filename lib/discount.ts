/**
 * Shared helpers for the admin discount (%) field.
 */

/**
 * Compute the sale price from an original price and a discount percentage.
 * Returns null when there is no discount (empty/0/negative/invalid).
 * Clamps the percentage to 0-95 so a sale price can never be absurd.
 */
export const computeSalePrice = (
  price: number | null | undefined,
  discountPercent: number | null | undefined
): number | null => {
  if (!price || price <= 0) return null;
  const discount = Number(discountPercent);
  if (!Number.isFinite(discount) || discount <= 0) return null;
  const safeDiscount = Math.min(Math.max(discount, 0), 95);
  // Round to a whole number so sale prices stay clean (e.g. 40% off 8999 = 5399)
  return Math.round((price * (100 - safeDiscount)) / 100);
};

/**
 * Derive the discount percentage from an original price and a sale price.
 * Returns null when there is no discount (or the values are invalid).
 */
export const computeDiscountPercent = (
  price: number | null | undefined,
  salePrice: number | null | undefined
): number | null => {
  if (!price || price <= 0 || !salePrice || salePrice <= 0 || salePrice >= price) {
    return null;
  }
  return Math.round((1 - salePrice / price) * 100);
};
