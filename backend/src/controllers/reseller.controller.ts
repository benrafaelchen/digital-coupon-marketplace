import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { Errors } from "../utils/errors";

/**
 * Reseller API controller — handles /api/v1/products endpoints.
 * Pricing internals (cost_price, margin_percentage) are never exposed.
 */
export const ResellerController = {
  async listProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.listUnsold();
      res.json(products);
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const product = await ProductService.getPublicById(productId);
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async purchase(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const { reseller_price } = req.body;
      if (reseller_price === undefined || typeof reseller_price !== "number") {
        throw Errors.validationError("reseller_price is required and must be a number");
      }

      const result = await ProductService.purchaseAsReseller(productId, reseller_price);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
