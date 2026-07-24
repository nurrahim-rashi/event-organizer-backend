import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";
import jwt from "jsonwebtoken";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../validators/auth.validator.js";
import { sendMail } from "../lib/mail.js";
import { Role } from "../generated/prisma/client.js";

export const registerService = async (body: RegisterSchema) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ApiError("Email already exists", 400);
  }

  const hashedPassword = await argon.hash(body.password);
  const generatedReferralCode =
    "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const rawCode = body.referredByCode;
  const usedReferralCode =
    rawCode && rawCode.trim() !== "" ? rawCode.trim().toUpperCase() : null;

  console.log("==========================================");
  console.log("1. Data Body Diterima:", body);
  console.log("2. Kode Referral Hasil Extract:", usedReferralCode);
  console.log("==========================================");

  const expiredAt = new Date();
  expiredAt.setMonth(expiredAt.getMonth() + 3);

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: (body.role as Role) || Role.USER,
        referralCode: generatedReferralCode,
      },
    });

    if (usedReferralCode) {
      console.log("3. Mencari Referrer dengan kode:", usedReferralCode);

      const referrer = await tx.user.findUnique({
        where: {
          referralCode: usedReferralCode,
        },
      });

      if (referrer) {
        console.log("4. ✅ Referrer DITEMUKAN! Email:", referrer.email);

        await tx.referralUsage.create({
          data: {
            referrerId: referrer.id,
            referredId: newUser.id,
            pointsEarned: 10000,
            expiredAt: expiredAt,
            isPointUsed: false,
          },
        });

        await tx.coupon.create({
          data: {
            userId: newUser.id,
            discount: 10000,
            expiredAt: expiredAt,
          },
        });

        console.log("5. 🎉 Poin & Kupon BERHASIL disimpan ke Database!");
      } else {
        console.log(
          "4. ❌ Referrer TIDAK DITEMUKAN untuk kode:",
          usedReferralCode,
        );
      }
    } else {
      console.log("3. ⚠️ Tidak ada kode referral yang dimasukkan.");
    }
  });

  return { message: "Register success" };
};

export const loginService = async (body: LoginSchema) => {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    throw new ApiError("Invalid credentials", 400);
  }

  const isPassMatch = await argon.verify(user.password, body.password);
  if (!isPassMatch) {
    throw new ApiError("Invalid credentials", 400);
  }

  const payload = { id: user.id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
  };
};

export const forgotPasswordService = async (body: ForgotPasswordSchema) => {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return { message: "Send email success" };
  }

  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET_RESET!, {
    expiresIn: "15m",
  });

  sendMail({
    to: body.email,
    subject: "Reset Password",
    templateName: "reset-password.hbs",
    context: {
      name: user.name,
      resetUrl: `${process.env.BASE_URL_FE}/reset-password/${token}`,
    },
  });

  return { message: "Send mail success" };
};

export const resetPasswordService = async (
  body: ResetPasswordSchema,
  userId: number,
) => {
  const hashedPassword = await argon.hash(body.password);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  if (!updatedUser) {
    throw new ApiError("Failed to update password", 500);
  }

  return { message: "Reset password success" };
};
