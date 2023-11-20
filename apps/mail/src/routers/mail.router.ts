import {
    SendMailBody,
    SendMailResetPassReqBody,
} from "./../interfaces/request/mail.body";

import { NextFunction, Request, Response, Router } from "express";
import {
    sendMailGoogle, sendMailGoogleForgotPassword,
    // getParamsByCode,
    // sendMailBasic,
    // sendMailOutlook,
    // sendMailResetPassword,
} from "../controllers";
import { sendMailResetPasswordValidator } from "../validator";

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
