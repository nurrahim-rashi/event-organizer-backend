import { Request, Response } from "express";
import * as couponService from "../services/coupon.service.js";

export const createCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const coupon = await couponService.createCouponService(req.body);
  res.status(201).json({ success: true, data: coupon });
};

export const getCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  const coupons = await couponService.getCouponsService(userId);
  res.status(200).json({ success: true, data: coupons });
};

export const updateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const coupon = await couponService.updateCouponService(
    Number(req.params.id),
    req.body,
  );
  res.status(200).json({ success: true, data: coupon });
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await couponService.deleteCouponService(Number(req.params.id));
  res
    .status(200)
    .json({ success: true, message: "Coupon deleted successfully" });
};
