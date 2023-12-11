import {
    SendMailBody,
    SendMailResetPassReqBody,
} from "../../interfaces/request/mail.body";

import { NextFunction, Request, Response, Router } from "express";
import {
    sendMailGoogle,
    sendMailGoogleForgotPassword,
    sendMailGoogleNewAccount,
    sendMailGoogleNewProject,
    sendMailGoogleUpdateAccount,
    // getParamsByCode,
    // sendMailBasic,
    // sendMailOutlook,
    // sendMailResetPassword,
} from "../../controllers";
import { sendMailResetPasswordValidator } from "../../validator";

export const router: Router = Router();

// router.get("/:code", async (req: Request, _: Response, next: NextFunction) => {
//     const code = req.params.code as string;
//     const result = await getParamsByCode(code);
//     next(result);
// });

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const result = await sendMailGoogle();
    next(result);
});

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
