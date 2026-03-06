import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();

router.get("/products", CustomerController.listProducts);
router.get("/products/:id", CustomerController.getProduct);
router.post("/products/:id/purchase", CustomerController.purchase);

export default router;
