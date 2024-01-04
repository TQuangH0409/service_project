export interface IProject {
    id: string;
    name: string;
    semester?: string;
    student_id: string;
    teacher_instruct_id: string;
    teacher_review_id?: string;
    research_area: string[];
}

export interface IResearchAreaP {
    name: string;
    number: string;
}
