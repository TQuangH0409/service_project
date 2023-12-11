import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";
import { router as assignmentRouter } from "./external/handle.router";

export const router: Router = Router();
router.use(`${configs.app.prefix}/assignments`, assignmentRouter);
// router.use(`${configs.app.prefix}/in/accounts`, inAccountRouter);

// router.use(`${configs.app.prefix}/users`, verifyToken, userRouter);
// router.use(`${configs.app.prefix}/in/users`, inUserRouter);
