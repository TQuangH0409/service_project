import { HttpError, Result, ResultSuccess, error } from "app";
import { configs } from "../configs";
import axios from "axios";
import { IUser } from "../interfaces/response/user.body";

export async function checkUserExits(params: {
    userId: string;
}): Promise<{ body?: ResultSuccess; status?: number }> {
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

export async function getAllUserByPosition(params: {
    position: string;
}): Promise<{
    body?: IUser[];
    status?: number;
}> {
    const url = `${configs.services.ad.getUrl()}users/position/${
        params.position
    }`;
    try {
        const res = await axios.get<IUser[]>(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
