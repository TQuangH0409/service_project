import axios from "axios";
import { IProject } from "../interfaces/response/project.body";
import { configs } from "../configs";
import { HttpError, error } from "app";

export async function getProjectsByStudent(student: string): Promise<{
    body?: IProject;
    status?: number;
}> {
    const url = `${configs.services.project.getUrl()}/info?student=${student}`;
    try {
        const res = await axios.get<IProject>(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
