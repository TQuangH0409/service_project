import { HttpError, error } from "app";
import { configs } from "../configs";
import axios from "axios";
import { IResearchArea } from "../interfaces/response/research_area.body";

export async function getAllResearchAreas(): Promise<{
    body?: IResearchArea[];
    status?: number;
}> {
    const url = `${configs.services.reseach_area.getUrl()}/`;
    try {
        const res = await axios.get<IResearchArea[]>(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

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
