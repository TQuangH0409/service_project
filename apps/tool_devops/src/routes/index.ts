import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";
import { router as TemplateRouter } from "./external/tool_devops.router";
import { router as InRaRouter } from "./internal/tool_devops.router";

export const router: Router = Router();
router.use(`${configs.app.prefix}/templates`, verifyToken, TemplateRouter);
// router.use(`${configs.app.prefix}/in/research-areas`, InRaRouter);

// router.use(`${configs.app.prefix}/users`, verifyToken, userRouter);
// router.use(`${configs.app.prefix}/in/users`, inUserRouter);
