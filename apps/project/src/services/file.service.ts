import { error, HttpError, HttpStatus } from "app";
import axios from "axios";
import { configs } from "../configs";
import {
    FileDBResBody,
    FileGoogleAPIResBody,
    FileUrlResBody,
} from "../interfaces/response";

export async function getInfoFileGoogleApi(id: string): Promise<{
    body?: FileGoogleAPIResBody;
    status?: HttpStatus;
    path: string;
}> {
    const url = `${configs.services.file.getUrl()}/info/${id}`;
    try {
        const res = await axios.get<FileGoogleAPIResBody>(`${url}`);
        return { body: res.data, path: url, status: res.status };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return {
                status: e.response?.status,
                path: url,
            };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

export async function getInfoFileInDB(id: string): Promise<{
    body?: FileDBResBody;
    status?: HttpStatus;
    path: string;
}> {
    const url = `${configs.services.file.getUrl()}/in-DB/${id}`;
    try {
        const res = await axios.get<FileDBResBody>(`${url}`);
        return { body: res.data, path: url, status: res.status };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return {
                status: e.response?.status,
                path: url,
            };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

export async function getPublicURL(id: string): Promise<{
    body?: FileUrlResBody;
    status?: HttpStatus;
    path: string;
}> {
    const url = `${configs.services.file.getUrl()}/${id}`;
    try {
        const res = await axios.get<FileUrlResBody>(`${url}`);
        return { body: res.data, path: url, status: res.status };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return {
                status: e.response?.status,
                path: url,
            };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
