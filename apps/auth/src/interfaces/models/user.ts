export enum UserAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    RESET_PASSWORD = "RESET_PASSWORD",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
}

export interface IUserActivity {
    actor: string;
    action: string;
    time: Date;
    note?: string;
}

export interface IUser {
    id: string;
    number: string;
    fullname: string;
    email: string;
    phone: string;
    position: string;
    is_active: boolean;
    avatar?: string;
    research_area?: IResearchArea[];
    cccd?: string;
    class?: string;
    school?: string;
    gen?: string;
    degree?: string;
    updated_time: Date;
    created_time: Date;
    created_by: string;
    activities: IUserActivity[];
}

export interface IResearchArea {
    name: string;
    number: string;
    experience: number;
}
