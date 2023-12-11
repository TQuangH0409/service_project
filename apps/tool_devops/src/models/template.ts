import mongoose from "mongoose";
import { ITemplateDf } from "../interface/models/template";

const templateSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            require: true,
        },
        language: {
            type: String,
            require: true,
        },
        avatar: {
            type: String,
            require: true,
        },
        type: {
            type: String,
            require: true,
        },
        fileId: {
            type: String,
            require: true,
        },
    },
    {
        versionKey: false,
    }
);

const TemplateDf = mongoose.model<ITemplateDf>(
    "dockerfiles",
    templateSchema
);
export default TemplateDf;
