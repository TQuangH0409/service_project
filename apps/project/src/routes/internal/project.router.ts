import express, { NextFunction, Request, Response } from "express";
import {
    checkProjectExits,
    getAllProjects,
} from "../../controller/project.controller";

export const router = express.Router();

router.get("/:id", async (req: Request, _: Response, next: NextFunction) => {
    const id = req.params.id as unknown as string;
    const result = await checkProjectExits({ id });
    next(result);
});

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const id = req.params.id as unknown as string;
    const result = await getAllProjects();
    next(result);
});
