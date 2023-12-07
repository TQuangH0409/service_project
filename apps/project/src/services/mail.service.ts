import { error, HttpError, HttpStatus, ResultSuccess, success } from "app";
import axios from "axios";
import { configs } from "../configs";

export async function sendMailResetPassword(
    email: string,
    link: string
): Promise<void> {
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const { status } = await axios.post(`${url}/reset-password`, {
            email,
            link,
        });
        if (status !== HttpStatus.OK) {
            throw new HttpError(err);
        }
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            if (e.response.status !== HttpStatus.OK) {
                throw new HttpError(err);
            }
        } else {
            throw new HttpError(err);
        }
    }
}

export async function sendMailGoogleNewProject(params: {
    teacher: string;
    student: string;
    project: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}): Promise<ResultSuccess> {
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const result = await axios.post(`${url}/new-project`, params);

        if (result.status !== HttpStatus.OK) {
            throw new HttpError(err);
        } else {
            return success.ok({ message: result.data.message });
        }
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            if (e.response.status !== HttpStatus.OK) {
                throw new HttpError(err);
            }
        } else {
            throw new HttpError(err);
        }
    }

    return success.noContent();
}
