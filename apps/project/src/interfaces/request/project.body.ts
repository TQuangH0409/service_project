export interface IProjectReqBody {
    name: string;
    student_id: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    semester?: string;
    research_area: string[];
}

export interface IProjectUpdateReqBody {
    name: string;
    discription?: {
        content?: string;
        attach?: string;
    };
    semester: string;
    research_area: string[];
    report?: string[];
    source_code?: string;
    rate?: {
        comment?: string;
        mark_mid?: string;
        mark_final?: string;
    };
}
