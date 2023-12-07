export interface IUser {
    id: string;
    number: string;
    fullname: string;
    email: string;
    position: string;
    research_area: IResearchAreaT[];
}

export interface IResearchAreaT {
    name: string;
    number: string;
    experience: number;
}
