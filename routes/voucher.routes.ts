import { Router } from "express";
import * as voucherController from "../controllers/voucher.controller.js";

const router = Router();

router.post("/", voucherController.createVoucher);
router.get("/", voucherController.getVouchers);
router.get("/:id", voucherController.getVoucherById);
router.put("/:id", voucherController.updateVoucher);
router.delete("/:id", voucherController.deleteVoucher);

export default router;
