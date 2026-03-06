/**
 * Typed application error that maps directly to the API error response format.
 * Controllers catch these and return { error_code, message } with the correct HTTP status.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  productNotFound: () =>
    new AppError(404, "PRODUCT_NOT_FOUND", "The requested product was not found"),

  productAlreadySold: () =>
    new AppError(409, "PRODUCT_ALREADY_SOLD", "This product has already been sold"),

  resellerPriceTooLow: (minimum: number) =>
    new AppError(
      400,
      "RESELLER_PRICE_TOO_LOW",
      `Reseller price must be at least ${minimum.toFixed(2)}`
    ),

  unauthorized: () =>
    new AppError(401, "UNAUTHORIZED", "Missing or invalid authentication token"),

  validationError: (detail: string) =>
    new AppError(400, "VALIDATION_ERROR", detail),
} as const;
