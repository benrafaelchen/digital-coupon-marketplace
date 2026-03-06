import Decimal from "decimal.js";

/**
 * Computes minimum_sell_price using safe decimal arithmetic.
 * Formula: cost_price * (1 + margin_percentage / 100)
 *
 * Uses decimal.js to avoid IEEE-754 floating-point rounding issues
 * that could cause off-by-one-cent pricing errors.
 */
export function computeMinimumSellPrice(
  costPrice: Decimal.Value,
  marginPercentage: Decimal.Value
): Decimal {
  const cost = new Decimal(costPrice);
  const margin = new Decimal(marginPercentage);
  return cost.mul(margin.div(100).plus(1));
}
