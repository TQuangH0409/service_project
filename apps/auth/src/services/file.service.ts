import { error, HttpError, HttpStatus } from "app";
import axios from "axios";
import { configs } from "../configs";

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
