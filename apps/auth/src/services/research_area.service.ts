import axios from "axios";
import { configs } from "../configs";
import { IResearchArea } from "../interfaces/response/research_area.body";
import { HttpError, ResultSuccess, error } from "app";

export async function getResearchAreaByNumber(number: string): Promise<{
    body?: IResearchArea;
    status?: number;
}> {
    const url = `${configs.services.reseach_area.getUrl()}/${number}`;
    try {
        const res = await axios.get<IResearchArea>(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

export async function checkResearchAreasExits(params: {
    numbers: string[];
}): Promise<{
    status: number;
}> {
    const url = `${configs.services.reseach_area.getUrl()}/check`;
    try {
        const res = await axios.post<ResultSuccess>(`${url}`, params);
        return { status: res.status };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
