import { Router } from "express";
import { ResellerController } from "../controllers/reseller.controller";
import { resellerAuth } from "../middleware/resellerAuth";

const router = Router();

// All reseller endpoints require Bearer token authentication
router.use(resellerAuth);

router.get("/products", ResellerController.listProducts);
router.get("/products/:productId", ResellerController.getProduct);
router.post("/products/:productId/purchase", ResellerController.purchase);

export default router;
