import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

/**
 * Customer-facing controller — serves the frontend storefront.
 * Prices are fixed at minimum_sell_price; customers cannot override.
 */
export const CustomerController = {
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
