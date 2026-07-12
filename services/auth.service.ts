import { User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";
import jwt from "jsonwebtoken";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator.js";

export const registerService = async (
    body: RegisterSchema
) => {

    const user = await prisma.user.findUnique({
        where: {email: body.email},
    });

    if (user) {
        throw new ApiError("Email already exist", 400);
    }

    const hashedPassword = await argon.hash(body.password);
    const generatedReferralCode = "REF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    await prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            role: body.role || "USER",
            referralCode: generatedReferralCode,
        },
    });

    return {
        message: "Register success"
    };
};

export const loginService = async (body: LoginSchema) => {
    const user = await prisma.user.findUnique({
        where: {email: body.email}
    });

    if (!user) {
        throw new ApiError("Invalid credentials", 400);
    }

    const isPassMatch = await argon.verify(user.password, body.password);

    if (!isPassMatch) {
        throw new ApiError("Invalid credentials", 400);
    }

    const payload = {id: user.id, role: user.role};
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "2h",
    });

    const {password, ...userWithoutPassword} = user;
    return {
        ...userWithoutPassword,
        accessToken,
    };
};