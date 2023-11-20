import { v1 } from "uuid";
import { Result, HttpStatus, success, HttpError, ResultSuccess } from "app";

import nodemailer, { Transporter } from "nodemailer";
import { configs } from "../configs";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";

async function transport(): Promise<
    nodemailer.Transporter<SMTPTransport.SentMessageInfo>
> {
    const oAuth2Client = new google.auth.OAuth2(
        configs.mail.client_id,
        configs.mail.client_secret,
        configs.mail.redirect_uri
    );

    oAuth2Client.setCredentials({ refresh_token: configs.mail.refresh_token });

    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: "trongquangvu80@gmail.com",
            clientId: configs.mail.client_id,
            clientSecret: configs.mail.client_secret,
            refreshToken: configs.mail.refresh_token,
            accessToken: accessToken,
        },
    } as SMTPTransport.Options);

    return transport;
}

export async function sendMailGoogle() {
    let info = await (
        await transport()
    ).sendMail({
        from: "<trongquangvu80@gmail.com>",
        to: "quang.vt198256@sis.hust.edu.vn",
        subject: "Testing, testing, 123",
        html: `
    <h1>Hello there</h1>
    <p>Isn't NodeMailer useful?</p>
    `,
    });

    console.log(info.messageId);
    return success.ok("info.messageId");
}

export async function sendMailGoogleForgotPassword(params: {
    password: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    let info = await (
        await transport()
    ).sendMail({
        from: "<trongquangvu80@gmail.com",
        to: params.email,
        subject: "Cấp lại mật khẩu",
        html: `
    <h1>Hello ${params.username}!</h1>
    <p>Mật khẩu mới của bạn là ${params.password}</p>
    `,
    });
    return success.ok({ message: "successful" });
}
