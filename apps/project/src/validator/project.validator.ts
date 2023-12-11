import { handleValidation } from "app";
import { RequestHandler } from "express";
import { ValidationChain, query } from "express-validator";

export const findProjectValidator = (): (
    | ValidationChain
    | RequestHandler
)[] => [
    query("size").replace([null, undefined], 10),
    query("page").replace([null, undefined], 0),

    query("size", "size must be integer and in [1:50]").isInt({
        min: 1,
        max: 50,
    }),
    query("page", "page must be integer and greater than -1").isInt({ min: 0 }),

    handleValidation,
];
