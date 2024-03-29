import { error, HttpError, HttpStatus } from "app";
import axios from "axios";
import { configs } from "../configs";
import { FileDBResBody, FileGoogleAPIResBody } from "../interfaces/response";

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


export async function getDownloadLinks(objectsId: string): Promise<{
    body?: { webContentLink: string; webViewLink: string };
    status?: HttpStatus;
    path: string;
}> {
    const url = `${configs.services.file.getUrl()}/${objectsId}`;
    try {
        const res = await axios.get<{
            webContentLink: string;
            webViewLink: string;
        }>(`${url}`);
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
