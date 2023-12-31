import { IResearchAreaT } from "../response/user.body";

export interface IAssignment {
    id: string;
    type: ETYPE;
    semester: string;
    limit: number;
    student: IUserAss[];
    teacher: IUserAss;
    project: IProjectAss[];
    created_time: Date;
    created_by: string;
}

export interface IProjectAss {
    id: string;
    name: string;
    student_id: string;
    teacher_instruct_id: string;
    teacher_review_id?: string;
    coincidence: number;
}

export interface IUserAss {
    id: string;
    number: string;
    fullname: string;
    email: string;
    position: string;
    research_area: IResearchAreaT[];
    school: string;
    coincidence?: number;
}

export enum ETYPE {
    INSTRUCT = "INSTRUCT",
    REVIEW = "REVIEW",
}

export interface IArray {
    id: ETYPEARRAY;
    array: (string | number)[][];
}

export enum ETYPEARRAY {
    S_T = "S_T",
    S_St = "S_St",
    T_St = "T_St",
    T_P = "T_P",
    S_P = "S_P",
}
