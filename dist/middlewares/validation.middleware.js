import { ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues
                    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                    .join(", ");
                return next(new ApiError(message, 400));
            }
            next(error);
        }
    };
};
