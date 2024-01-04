import { Router } from "express";
import { configs } from "../configs";
import { router as assignmentRouter } from "./external/handle.router";

export const router: Router = Router();
router.use(`${configs.app.prefix}/assignments`, assignmentRouter);
