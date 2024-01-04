import { HttpError, Result, ResultSuccess, error } from "app";
import { configs } from "../configs";
import axios from "axios";
import { IProject } from "../interfaces/response/project.body";

export async function checkProjectExits(params: {
    id: string;
}): Promise<{ body?: ResultSuccess; status?: number }> {
    const url = `${configs.services.project.getUrl()}/${params.id}`;
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

export async function getAllProjects(params: { semester: string }): Promise<{
    body?: IProject[];
    status?: number;
}> {
    const url = `${configs.services.project.getUrl()}/?semester=${
        params.semester
    }`;
    try {
        const res = await axios.get<IProject[]>(`${url}`);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
export async function getProjectByStudent(student: string): Promise<{
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

export async function getProjectById(params: {
    id: string;
}): Promise<{ body?: IProject; status?: number }> {
    const url = `${configs.services.project.getUrl()}/${params.id}`;
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
