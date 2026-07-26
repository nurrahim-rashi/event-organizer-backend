import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-error.js";
export const verifyToken = (secretKey) => {
    return (req, res, next) => {
        console.log("--- DEBUG: Masuk ke verifyToken ---");
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("--- DEBUG: Token hilang atau format salah ---");
                throw new ApiError("Unauthorized, token missing", 401);
            }
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, secretKey);
            console.log("--- DEBUG: Token berhasil diverifikasi untuk user:", decoded.id, " ---");
            res.locals.user = { id: decoded.id, role: decoded.role };
            req.user = {
                id: decoded.id,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            console.log("--- DEBUG: Gagal di verifyToken:", error.message, " ---");
            next(new ApiError(error.message || "Invalid Token", 401));
        }
    };
};
export const verifyRole = (roles) => {
    return (req, res, next) => {
        const user = res.locals.user;
        if (!user) {
            throw new ApiError("Authentication required", 401);
        }
        if (!roles.includes(user.role)) {
            throw new ApiError("You don't have access.", 403);
        }
        next();
    };
};
