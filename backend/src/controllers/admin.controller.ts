import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

/**
 * Admin CRUD controller — handles /api/admin/products endpoints.
 * Admin can view all fields including pricing internals and coupon values.
 */
export const AdminController = {
  async listProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.listAll();
      res.json(products);
    } catch (err) {
      next(err);
    }
  },

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getById(id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create({
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.image_url,
        costPrice: req.body.cost_price,
        marginPercentage: req.body.margin_percentage,
        valueType: req.body.value_type,
        value: req.body.value,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.update(id, {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.image_url,
        costPrice: req.body.cost_price,
        marginPercentage: req.body.margin_percentage,
        valueType: req.body.value_type,
        value: req.body.value,
      });
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ProductService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
