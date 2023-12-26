import express, { NextFunction, Request, Response } from "express";
import {
    getArraySpecializeProject,
    getArraySpecializeStudent,
    getArraySpecializeTeacher,
    getArrayTeacherProject,
    getArrayTeacherStudent,
    handleInstruct,
    handleReview,
} from "../../controller/handle.controller";
import { getAssignmentByStudent } from "../../controller/assignment.controller";

export const router = express.Router();

router.get("/S-S", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeStudent();

    next(result);
});

router.get("/S-T", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeTeacher();

    next(result);
});

router.get("/S-P", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeProject();

    next(result);
});

router.get("/T-St", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArrayTeacherStudent();

    next(result);
});

router.get("/T-P", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArrayTeacherProject();

    next(result);
});

router.get(
    "/instruct",
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await handleInstruct({
            limit: req.query.limit as unknown as number,
            userId: "",
            type: req.query.type as string,
        });

        next(result);
    }
);

router.get("/review", async (req: Request, _: Response, next: NextFunction) => {
    const result = await handleReview({
        limit: req.query.limit as unknown as number,
        userId: "",
        type: req.query.type as string,
    });

    next(result);
});

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const { student, teacher, project, type } = req.query;
    const result = await getAssignmentByStudent({
        student: student as string,
        teacher: teacher as string,
        project: project as string,
        type: type as string,
    });

    next(result);
});
