import { ResultSuccess, success } from "app";
import TemplateDf from "../models/template";
import { v1 } from "uuid";
import { ETYPE } from "../interface/models/template";

export async function createTemplate(params: {
    name: string;
    description: string;
    language: string;
    avatar: string;
    type: ETYPE;
    fileId: string;
}): Promise<ResultSuccess> {
    const template = new TemplateDf({
        id: v1(),
        name: params.name,
        description: params.description,
        language: params.language,
        avatar: params.avatar,
        type: params.type,
        fileId: params.fileId,
    });

    template.save();

    return success.ok(template);
}

export async function getAllTemplateByType(params: {
    type: ETYPE;
}): Promise<ResultSuccess> {

    const templates = await TemplateDf.find({ type: params.type }, { _id: 0 });

    return success.ok(templates);
}


