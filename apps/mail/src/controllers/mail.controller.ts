import { success, ResultSuccess } from "app";
import nodemailer from "nodemailer";
import { configs } from "../configs";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import axios from "axios";
import mime from "mime-types";
import { Transform } from "stream";
import { IResearchArea } from "../interfaces/request/research_area.body";
import { KEY } from "../interfaces/models";

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

export async function sendMailGoogleForgotPassword(params: {
    password: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    await (
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

export async function sendMailGoogleNewAccount(params: {
    password: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    await (
        await transport()
    ).sendMail({
        from: "Hệ thống trường ĐHBK Hà Nội",
        to: params.email,
        subject: "Tài khoản truy cập hệ thống được cấp",
        html: `
    <h1>Hello ${params.username}!</h1>
    <p>Tên đăng nhập của bạn là ${params.email}</p>
    <p>Mật khẩu của bạn là ${params.password}</p>
    `,
    });
    return success.ok({ message: "successful" });
}

export async function sendMailGoogleNewProject(params: {
    teacher: string;
    student: {
        fullname: string;
        email: string;
    };
    project: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}): Promise<ResultSuccess> {
    // Đường dẫn URL đến file cần tải

    let attachments;

    if (params.fileName && params.fileType && params.fileUrl) {
        const content = createAttachmentStream(params.fileUrl);
        attachments = [
            {
                filename: `${params.fileName}.${mime.extension(
                    params.fileType
                )}`,

                content: content,
                contentType: params.fileType,
            },
        ];
    } else {
        attachments = undefined;
    }

    (await transport()).sendMail({
        from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
        to: `${params.student.email}`,
        subject: "Đồ án tốt nghiệp",
        html: `
    <h1>Hello ${params.student.fullname}!</h1>
    <p>Giáo viên hướng dẫn ${params.teacher} đã gán cho bạn một ĐATN</p>
    <p>Tên đề tài: ${params.project}</p>
    <p>Vui lòng đăng nhập hệ thống để kiểm tra</p>
    <p>File mô tả yêu cầu đính kèm</p>
    `,
        attachments: attachments,
    });
    return success.ok({ message: "successful" });
}

// Hàm tạo stream từ URL và MIME type
function createAttachmentStream(url: string): Transform {
    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            this.push(chunk, encoding);
            callback();
        },
    });

    axios
        .get(url, { responseType: "stream" })
        .then((response) => {
            response.data.pipe(transformStream);
        })
        .catch((error) => {
            console.error("Error fetching attachment:", error);
        });

    return transformStream;
}

export async function sendMailGoogleUpdateAccount(params: {
    fullname?: string;
    phone?: string;
    roles?: string[];
    position?: string;
    is_active?: boolean;
    avatar?: string;
    research_area?: IResearchArea[];
    cccd?: string;
    class?: string;
    school?: string;
    gen?: string;
    degree?: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    const list = objectToHtmlList(params);

    await (
        await transport()
    ).sendMail({
        from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
        to: params.email,
        subject: "ADMIN cập nhật thông tin cá nhân ",
        html: `
    <h1>Hello ${params.username}!</h1>
    <p>ADMIN đã thực hiện cập nhập thông tin cá nhân bạn</p>
    <p>Nội dung thay đổi</p>
    <ul>
       ${list}
    </ul>
    `,
    });
    return success.ok({ message: "successful" });
}

function objectToHtmlList(obj: Record<string, any>): string {
    let list = "<ul>";
    Object.entries(obj).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            KEY.hasOwnProperty(key) === true
        ) {
            if (Array.isArray(value)) {
                // Nếu giá trị là một mảng, chuyển mảng thành danh sách
                list += `<li>${KEY[key]}: <ul>${value
                    .map((item) => `${objectToHtmlList(item)}`)
                    .join("")}</ul></li>`;
            } else if (typeof value === "object") {
                // Nếu giá trị là một đối tượng, chuyển đối tượng thành danh sách con
                list += `<li>${KEY[key]}: ${objectToHtmlList(value)}</li>`;
            } else {
                // Nếu giá trị không phải là mảng hoặc đối tượng, in ra giá trị
                list += `<li>${KEY[key]}: ${value}</li>`;
            }
        }
    });
    list += "</ul>";
    return list;
}

export async function sendMailGoogleInstruct(params: {
    teacher: {
        fullname: string;
        email: string;
    };
    student: [
        {
            fullname: string;
            email: string;
        }
    ];
}): Promise<ResultSuccess> {
    // Đường dẫn URL đến file cần tải

    // Gửi mail cho sinh viên

    const listMailStudent = params.student;

    await Promise.all(
        listMailStudent.map(async (e) => {
            return (await transport()).sendMail({
                from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
                to: `${e.email}`,
                subject: "Giáo viên hướng dẫn đồ án tốt nghiệp",
                html: `
                <h1>Kính gửi: ${e.fullname}!</h1>
                <p>Hệ thống nhà trường đã phân công giáo viên hướng dẫn đồ án tốt nghiệp</p>
                <p> Giáo viên hướng dẫn: ${params.teacher.fullname} </p>
                <p> Email: ${params.teacher.email} </p>
                <p>Vui lòng đăng nhập hệ thống để kiểm tra và liên hệ với giáo viên</p>
        `,
            });
        })
    );

    let str = "<table>";

    listMailStudent.map((s) => {
        str += `<tr><td>Sinh viên : ${s.fullname}</td></tr><tr><td>Email : ${s.email}</td></tr>`;
    });

    str += "</table>";

    (await transport()).sendMail({
        from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
        to: `${params.teacher.email}`,
        subject: "Phân công sinh viên cho giáo viên hướng dẫn tốt nghiệp",
        html: `
        <h1>Kính gửi: ${params.teacher.fullname}!</h1>
        <p>Hệ thống nhà trường đã phân công thầy/cô hướng dẫn sinh viên</p>
        ${str}
        <p>Vui lòng đăng nhập hệ thống để kiểm tra và liên hệ với sinh viên</p>
`,
    });
    return success.ok({ message: "successful" });
}

export async function sendMailGoogleReview(params: {
    teacher: {
        fullname: string;
        email: string;
    };
    student: [
        {
            fullname: string;
            email: string;
            project: string;
        }
    ];
}): Promise<ResultSuccess> {
    // Đường dẫn URL đến file cần tải

    // Gửi mail cho sinh viên

    const listMailStudent = params.student;

    await Promise.all(
        listMailStudent.map(async (e) => {
            return (await transport()).sendMail({
                from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
                to: `${e.email}`,
                subject: "Giáo viên phản biện đồ án tốt nghiệp",
                html: `
                <h1>Kính gửi: ${e.fullname}!</h1>
                <p>Hệ thống nhà trường đã phân công giáo viên phản biện đồ án tốt nghiệp </p>
                <p>Đồ án tốt nghiệp: ${e.project}</p>
                <p> Giáo viên hướng dẫn: ${params.teacher.fullname} </p>
                <p> Email: ${params.teacher.email} </p>
                <p>Vui lòng đăng nhập hệ thống để kiểm tra</p>
        `,
            });
        })
    );

    let str = "<table>";

    listMailStudent.map((s) => {
        str += `<tr><td>Sinh viên : ${s.fullname}</td> <td>Đề tài : ${s.project}</td> </tr> <td>Email : ${s.email}</td> </tr>`;
    });

    str += "</table>";

    (await transport()).sendMail({
        from: "[Hệ thống trường ĐHBK Hà Nội]<trongquangvu80@gmail.com>",
        to: `${params.teacher.email}`,
        subject: "Phân công sinh viên cho giáo viên phản biện đồ án tốt nghiệp",
        html: `
        <h1>Kính gửi: ${params.teacher.fullname}!</h1>
        <p>Hệ thống nhà trường đã phân công thầy/cô hướng dẫn sinh viên</p>
        ${str}
        <p>Vui lòng đăng nhập hệ thống để kiểm tra và liên hệ với sinh viên</p>
`,
    });
    return success.ok({ message: "successful" });
}
