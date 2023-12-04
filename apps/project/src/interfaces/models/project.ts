export interface IProject {
    id: string;
    name: string;
    student_id: string;
    teacher_instruct_id: string;
    teacher_review_id?: string;
    report?: IReport[];
    source_code?: string;
    comments?: IComment;
    rate?: {
        comment?: string;
        mark_mid?: string;
        mark_final?: string;
    };
    research_area?: IResearchArea[];
    desciption?: {
        content: string;
        attach: string;
    };
    created_time: Date;
    created_by: string;
    updated_by?: string;
    updated_time?: Date;
    is_active: boolean;
}

export interface IComment {
    actor: string;
    action: string;
    time: Date;
    content?: string;
    attachs?: string[];
    reply?: string[];
    created_time: Date;
    created_by: string;
    updated_by?: string;
    updated_time?: Date;
}

export interface IReport {
    objectId: string;
    name: string;
    type: string;
    uploaded_by: string;
    created_time: Date;
}

export interface IResearchArea {
    name: string;
    experience: string;
}
