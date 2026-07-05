import { Request, Response } from "express";
import * as voucherService from "../services/voucher.service.js";

export const createVoucher = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const voucher = await voucherService.createVoucherService(req.body);
    res.status(201).json({ success: true, data: voucher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVouchers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
    const vouchers = await voucherService.getVouchersService(eventId);
    res.status(200).json({ success: true, data: vouchers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVoucherById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const voucher = await voucherService.getVoucherByIdService(
      Number(req.params.id),
    );
    if (!voucher) {
      res.status(404).json({ success: false, message: "Voucher not found" });
      return;
    }
    res.status(200).json({ success: true, data: voucher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVoucher = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const voucher = await voucherService.updateVoucherService(
      Number(req.params.id),
      req.body,
    );
    res.status(200).json({ success: true, data: voucher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVoucher = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await voucherService.deleteVoucherService(Number(req.params.id));
    res
      .status(200)
      .json({ success: true, message: "Voucher deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
