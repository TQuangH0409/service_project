import express, { NextFunction, Request, Response } from "express";
import { getAllResearchAreas } from "../../controllers/research_area.controller";

export const router = express.Router();

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getAllResearchAreas();
    next(result);
});
