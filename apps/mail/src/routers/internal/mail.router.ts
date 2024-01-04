import { SendMailResetPassReqBody } from "../../interfaces/request/mail.body";

import { NextFunction, Request, Response, Router } from "express";
import {
    sendMailGoogleForgotPassword,
    sendMailGoogleInstruct,
    sendMailGoogleNewAccount,
    sendMailGoogleNewProject,
    sendMailGoogleReview,
    sendMailGoogleUpdateAccount,
} from "../../controllers";
import { sendMailResetPasswordValidator } from "../../validator";

export const router: Router = Router();

router.post(
    "/forgot-password",
    sendMailResetPasswordValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as SendMailResetPassReqBody;
        const result = await sendMailGoogleForgotPassword(body);
        next(result);
    }
);

router.post(
    "/new-account",
    sendMailResetPasswordValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as SendMailResetPassReqBody;
        const result = await sendMailGoogleNewAccount(body);
        next(result);
    }
);

router.post(
    "/new-project",
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body;
        const result = await sendMailGoogleNewProject(body);
        next(result);
    }
);

router.post(
    "/update-account",
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body;
        const result = await sendMailGoogleUpdateAccount(body);
        next(result);
    }
);

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
