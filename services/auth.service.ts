import { User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import argon from "argon2";
import jwt from "jsonwebtoken";

export const loginService = async (body: Pick<User, "email" | "password">) => {
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