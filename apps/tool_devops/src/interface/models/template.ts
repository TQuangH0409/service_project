export interface ITemplateDf {
    id: string;
    name: string;
    description: string;
    language: string;
    avatar: string;
    type: string;
    fileId: string;
}

export enum ETYPE {
    DOCKERFILE = "DOCKERFILE",
    DOCKERCOMPOSE = "DOCKERCOMPOSE",
}
