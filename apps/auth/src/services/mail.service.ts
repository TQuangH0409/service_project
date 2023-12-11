import { error, HttpError, HttpStatus, ResultSuccess, success } from "app";
import axios from "axios";
import { configs } from "../configs";
import { IResearchArea } from "../interfaces/models";

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

export async function sendMailGoogleForgotPassword(params: {
    password: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const result = await axios.post(`${url}/forgot-password`, params);

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

export async function sendMailGoogleNewAccount(params: {
    password: string;
    username: string;
    email: string;
}): Promise<ResultSuccess> {
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const result = await axios.post(`${url}/new-account`, params);

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
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const result = await axios.post(`${url}/update-account`, params);

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
