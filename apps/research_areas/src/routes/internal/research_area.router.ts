import express, { NextFunction, Request, Response } from "express";
import {
    checkResearchAreasExits,
    getAllResearchAreas,
    getResearchAreaByNumber,
} from "../../controllers/research_area.controller";

export const router = express.Router();

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getAllResearchAreas();
    next(result);
});

router.get(
    "/:number",
    async (req: Request, _: Response, next: NextFunction) => {
        const number = req.params.number as string;
        const result = await getResearchAreaByNumber({ number });
        next(result);
    }
);

router.post(
    "/check",
    async (req: Request, _: Response, next: NextFunction) => {
        const numbers = req.body.numbers as string[];
        const result = await checkResearchAreasExits({ numbers });
        next(result);
    }
);
