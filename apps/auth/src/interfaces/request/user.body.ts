export interface CreateUserReqBody {
    email: string;
    number: string;
    fullname: string;
    roles: string[];
    phone?: string;
    password: string;
    position?: string;
    is_active: boolean;
}

export interface FindUserReqBody {
    id: string;
    email: string;
    number: string;
    fullname?: string;
    phone?: string;
    position?: string;
    is_active: boolean;
    created_time: Date;
    updated_time: Date;
    last_time_ticket: Date;
}

export interface UpdateUserReqBody {
    fullname?: string;
    number: string;
    phone?: string;
    roles?: string[];
    position?: string;
    is_active?: boolean;
}

export interface UserImport {
    index: number;
    number: string;
    email: string;
    fullname?: string;
    phone?: string;
    password?: string;
    position?: string;
    roles: string[];
}

export interface UpdateUserActivationReqBody {
    ids: string[];
    status: boolean;
}

export type ImportUserReqBody = UserImport[];
