import express, { NextFunction, Request, Response } from "express";
import { verifyRole } from "../../middlewares";
import {
    createdResearchArea,
    deleteResearchArea,
    findResearchArea,
    getResearchAreaById,
    updateResearchArea,
} from "../../controllers/research_area.controller";
import { findReaserchAreaValidator } from "../../validator/reaserch_area.validator";
import { FindReqQuery } from "../../interfaces/request/reaserch_area.query";

export const router = express.Router();

router.post(
    "/",
    verifyRole("SA"),
    async (req: Request, _: Response, next: NextFunction) => {
        const name = req.body.name as string;
        const number = req.body.number as string;
        const userId = req.payload?.id as string;
        const result = await createdResearchArea({ name, number, userId });
        next(result);
    }
);

router.put(
    "/:id",
    verifyRole("SA"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const name = req.body.name as string;
        const number = req.body.number as string;
        const userId = req.payload?.id as string;
        const result = await updateResearchArea({ id, name, number, userId });
        next(result);
    }
);

router.delete(
    "/:id",
    verifyRole("SA"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const userId = req.payload?.id as string;
        const result = await deleteResearchArea({ id, userId });
        next(result);
    }
);

router.get(
    "/",
    verifyRole("SA"),
    findReaserchAreaValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const query = req.query as unknown as FindReqQuery;
        const result = await findResearchArea({ ...query });
        next(result);
    }
);

router.get(
    "/:id",
    verifyRole("SA"),
    async (req: Request, _: Response, next: NextFunction) => {
        const id = req.params.id as string;
        const result = await getResearchAreaById({ id });
        next(result);
    }
);
