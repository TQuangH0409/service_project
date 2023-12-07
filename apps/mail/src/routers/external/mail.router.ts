import { sendMailGoogleNewProject } from "../../controllers";

import { NextFunction, Request, Response, Router } from "express";

export const router: Router = Router();

router.post("/", async (req: Request, _: Response, next: NextFunction) => {
    const body = req.body;
    const result = await sendMailGoogleNewProject(body);
    next(result);
});
