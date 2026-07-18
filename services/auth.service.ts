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
import { Role } from "../generated/prisma/enums.js";

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

  await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: (body.role as Role) || Role.USER,
      referralCode: generatedReferralCode,
    },
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
