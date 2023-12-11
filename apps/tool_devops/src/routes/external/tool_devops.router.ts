import express, { NextFunction, Request, Response } from "express";
import { verifyRole } from "../../middlewares";
import {
    createTemplate,
    getAllTemplateByType,
} from "../../controller/template.controller";
import { ETYPE } from "../../interface/models/template";

export const router = express.Router();

router.post("/", async (req: Request, _: Response, next: NextFunction) => {
    const { name, description, language, avatar, type, fileId } = req.body;

    const result = await createTemplate({
        name,
        description,
        language,
        avatar,
        type,
        fileId,
    });

    next(result);
});

router.get("/types", async (req: Request, _: Response, next: NextFunction) => {
    const type = req.query.type as ETYPE;

    const result = await getAllTemplateByType({ type });

    next(result);
});
