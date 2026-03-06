import { Request, Response, NextFunction } from "express";
import { Errors } from "../utils/errors";

/**
 * Bearer-token authentication for reseller API endpoints.
 * Compares the Authorization header against the configured token.
 */
export function resellerAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw Errors.unauthorized();
  }

  const token = header.slice(7);
  if (token !== process.env.RESELLER_API_TOKEN) {
    throw Errors.unauthorized();
  }

  next();
}
