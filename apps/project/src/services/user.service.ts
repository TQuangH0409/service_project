import { HttpError, Result, error } from "app";
import { configs } from "../configs";
import axios from "axios";

export async function checkUserExits(params: {
    userId: string;
}): Promise<{ body?: Result; status?: number }> {
    const url = `${configs.services.ad.getUrl()}users/${params.userId}`;
    try {
        const res = await axios.get(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
