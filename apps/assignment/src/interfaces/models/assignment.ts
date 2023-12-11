export interface IAssignment {
    id: string;
    type: ETYPE;
    student: IStudentAss[];
    teacher: string;
    project: IProjectAss[];
    created_time: Date;
    created_by: string;
}

export interface IProjectAss {
    id: string;
    coincidence: number;
}

export interface IStudentAss {
    id: string;
    coincidence: number;
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
    S_P = "S_P"
}