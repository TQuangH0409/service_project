import express, { NextFunction, Request, Response } from "express";
import {
    getArraySpecializeProject,
    getArraySpecializeStudent,
    getArraySpecializeTeacher,
    getArrayTeacherProject,
    getArrayTeacherStudent,
    handleInstruct,
    handleReview,
} from "../../controller/handle.controller";
import {
    getAssedStudentByTeacher,
    getAssignment,
} from "../../controller/assignment.controller";

export const router = express.Router();

router.get("/S-S", async (req: Request, _: Response, next: NextFunction) => {
    const semester = req.query.semester as string;
    const result = await getArraySpecializeStudent({ semester: semester });

    next(result);
});

router.get("/S-T", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeTeacher();

    next(result);
});

router.get("/S-P", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArraySpecializeProject();

    next(result);
});

router.get("/T-St", async (req: Request, _: Response, next: NextFunction) => {
    const semester = req.query.semester as string;
    const result = await getArrayTeacherStudent({ semester: semester });

    next(result);
});

router.get("/T-P", async (req: Request, _: Response, next: NextFunction) => {
    const result = await getArrayTeacherProject();

    next(result);
});

router.get(
    "/instruct",
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await handleInstruct({
            limit: req.query.limit as unknown as number,
            userId: "",
            type: req.query.type as string,
            semester: req.query.semester as string,
        });

        next(result);
    }
);

router.get("/review", async (req: Request, _: Response, next: NextFunction) => {
    const result = await handleReview({
        limit: req.query.limit as unknown as number,
        userId: "",
        type: req.query.type as string,
        semester: req.query.semester as string,
    });

    next(result);
});

router.get(
    "/teacher/:id/students",
    async (req: Request, _: Response, next: NextFunction) => {
        const result = await getAssedStudentByTeacher({
            teacher: req.params.id as unknown as string,
            type: req.query.type as string,
        });

        next(result);
    }
);

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const { student, teacher, project, type } = req.query;
    const result = await getAssignment({
        student: student as string,
        teacher: teacher as string,
        project: project as string,
        type: type as string,
    });

    next(result);
});
