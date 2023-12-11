import express, { NextFunction, Request, Response } from "express";
import {
    getArraySpecializeStudent,
    getArraySpecializeTeacher,
    getArrayTeacherStudent,
    handleInstruct,
    handleReview,
} from "../../controller/handle.controller";

export const router = express.Router();

router.get("/S-S", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeStudent();

    next(result);
});

router.get("/S-T", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeTeacher();

    next(result);
});

router.get("/T-St", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArrayTeacherStudent();

    next(result);
});

router.get(
    "/instruct",
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await handleInstruct({ userId: "" });

        next(result);
    }
);

router.get(
    "/review",
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await handleReview({ userId: "" });

        next(result);
    }
);