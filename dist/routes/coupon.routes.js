import { Router } from "express";
import * as couponController from "../controllers/coupon.controller.js";
const router = Router();
router.post("/", couponController.createCoupon);
router.get("/", couponController.getCoupons);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
export default router;
