import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";
import { router as raRouter } from "./external/research_area.router";
import { router as InRaRouter } from "./internal/research_area.router";

export const router: Router = Router();
router.use(`${configs.app.prefix}/research-areas`, verifyToken, raRouter);
router.use(`${configs.app.prefix}/in/research-areas`, InRaRouter);

// router.use(`${configs.app.prefix}/users`, verifyToken, userRouter);
// router.use(`${configs.app.prefix}/in/users`, inUserRouter);
