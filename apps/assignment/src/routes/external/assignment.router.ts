import express, { NextFunction, Request, Response } from "express";
import { getAssignmentByStudent } from "../../controller/assignment.controller";

export const router = express.Router();

// router.get("/:id", async (req: Request, _: Response, next: NextFunction) => {
//     // const result = await getAssignmentByStudent({ student: req.params.id });

//     next(result);
// });
