import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";

const router = Router();

router.get("/products", AdminController.listProducts);
router.get("/products/:id", AdminController.getProduct);
router.post("/products", AdminController.createProduct);
router.put("/products/:id", AdminController.updateProduct);
router.delete("/products/:id", AdminController.deleteProduct);

export default router;
