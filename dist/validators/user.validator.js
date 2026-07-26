import { ApiError } from "../utils/api-error.js";
export const createUserValidator = (req, res, next) => {
    if (!req.body.name) {
        throw new ApiError("Name is required", 400);
    }
    next();
};
