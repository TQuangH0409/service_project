import {
    sendMailGoogleInstruct,
    sendMailGoogleNewProject,
    sendMailGoogleReview,
} from "../../controllers";

import { NextFunction, Request, Response, Router } from "express";

export const router: Router = Router();

router.post("/", async (req: Request, _: Response, next: NextFunction) => {
    const body = req.body;
    const result = await sendMailGoogleNewProject(body);
    next(result);
});

router.post(
    "/instruct",
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body;
        const result = await sendMailGoogleInstruct(body);
        next(result);
    }
);

router.post(
    "/review",
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body;
        const result = await sendMailGoogleReview(body);
        next(result);
    }
);
