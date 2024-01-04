import express, { NextFunction, Request, Response } from "express";
import { verifyRole } from "../../middlewares";
import {
    IProjectReqBody,
    IProjectUpdateReqBody,
} from "../../interfaces/request/project.body";
import {
    createdProject,
    deleteProject,
    findProject,
    getProjectById,
    getProjectByStudent,
    getProjectInstructByTeacher,
    getProjectReviewByTeacher,
    updateProject,
} from "../../controller/project.controller";
import { FindReqQuery } from "../../interfaces/request/project.query";
import { findProjectValidator } from "../../validator/project.validator";

export const router = express.Router();

router.post(
    "/",
    // verifyRole("T"),
    async (req: Request, _: Response, next: NextFunction) => {
        const query = req.body as IProjectReqBody;
        const userId = req.payload?.id as string;
        const result = await createdProject({ ...query, userId : userId });
        next(result);
    }
);

router.put(
    "/:id",
    verifyRole("T", "S"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const body: IProjectUpdateReqBody = req.body;
        const userId = req.payload?.id as string;
        const result = await updateProject({ id, ...body, userId });
        next(result);
    }
);

router.get(
    "/",
    verifyRole("SA", "T", "S"),
    findProjectValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const query = req.query as unknown as FindReqQuery;
        const result = await findProject({ ...query });
        next(result);
    }
);

router.get(
    "/project-review",
    verifyRole("T"),
    findProjectValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.payload?.id as string;
        const query = req.query as unknown as FindReqQuery;
        const result = await getProjectReviewByTeacher({
            ...query,
            teacher_review_id: id,
        });
        next(result);
    }
);

router.get(
    "/project-instruct",
    verifyRole("T"),
    findProjectValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.payload?.id as string;
        const query = req.query as unknown as FindReqQuery;
        const result = await getProjectInstructByTeacher({
            ...query,
            teacher_instruct_id: id,
        });
        next(result);
    }
);

router.get(
    "/student/:id",
    verifyRole("SA", "T", "S"),
    findProjectValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await getProjectByStudent({
            student: req.params.id,
        });
        next(result);
    }
);

router.get(
    "/:id",
    verifyRole("SA", "T", "S"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as unknown as string;
        const result = await getProjectById({ id });
        next(result);
    }
);

router.delete(
    "/:id",
    verifyRole("SA", "T"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as unknown as string;
        const result = await deleteProject({ id });
        next(result);
    }
);
