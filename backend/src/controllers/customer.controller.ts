import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

/**
 * Customer-facing controller — serves the frontend storefront.
 * Prices are fixed at minimum_sell_price; customers cannot override.
 *
 * Unlike the reseller API, the customer list includes sold items (with is_sold
 * flag) so the frontend can display them as dimmed/disabled. Pricing internals
 * and coupon values are still never exposed in listings.
 */
export const CustomerController = {
  async listProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.listAllForCustomer();
      res.json(products);
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getPublicById(id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async purchase(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await ProductService.purchaseAsCustomer(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
