import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";
import { router as projectRouter } from "./external/project.router";
import { router as inProjectRouter } from "./internal/project.router";

export const router: Router = Router();
// router.use(`${configs.app.prefix}/projects`, projectRouter);
router.use(`${configs.app.prefix}/projects`, verifyToken, projectRouter);
router.use(`${configs.app.prefix}/in/projects`, inProjectRouter);

// router.use(`${configs.app.prefix}/users`, verifyToken, userRouter);
// router.use(`${configs.app.prefix}/in/users`, inUserRouter)
