import express, { NextFunction, Request, Response } from "express";
import {
    checkProjectExits,
    getAllProjects,
    getProjectByStudent,
} from "../../controller/project.controller";

export const router = express.Router();

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const id = req.params.id as unknown as string;
    const result = await getAllProjects();
    next(result);
});

router.get("/info", async (req: Request, _: Response, next: NextFunction) => {
    const student = req.query.student as string;
    const result = await getProjectByStudent({ student });
    next(result);
});

router.get("/:id", async (req: Request, _: Response, next: NextFunction) => {
    const id = req.params.id as unknown as string;
    const result = await checkProjectExits({ id });
    next(result);
});
