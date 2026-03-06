import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Global error handler — converts AppError instances into the required
 * { error_code, message } JSON format. Unknown errors become 500s.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error_code: err.errorCode,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error_code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
  });
}
