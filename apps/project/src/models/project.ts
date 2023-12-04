import mongoose from "mongoose";
import { IProject } from "../interfaces/models/project";

const reportSchema = new mongoose.Schema(
    {
        objectId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            require: true,
        },
        uploaded_by: {
            type: String,
            require: false,
        },
        created_time: {
            type: Date,
            require: true,
        },
    },
    {
        _id: false,
        versionKey: false,
    }
);

const commentSchema = new mongoose.Schema(
    {
        actor: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: ["CREATE", "UPDATE", "REPLY"],
        },
        time: {
            type: Date,
            required: true,
        },
        reply: [
            {
                type: String,
                required: false,
            },
        ],
        content: [
            {
                type: String,
                required: false,
            },
        ],
        attachs: [
            {
                type: String,
                required: false,
            },
        ],
        created_by: {
            type: String,
            require: true,
        },
        updated_by: {
            type: String,
            require: false,
        },
        created_time: {
            type: Date,
            require: true,
        },
        updated_time: {
            type: Date,
            require: false,
        },
    },
    {
        _id: false,
        versionKey: false,
    }
);

const projectSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        student_id: {
            type: String,
            require: true,
        },
        teacher_instruct_id: {
            type: String,
            require: true,
        },
        teacher_review_id: {
            type: String,
            require: true,
        },
        source_code: {
            type: String,
            require: false,
        },
        discription: {
            type: {
                content: {
                    type: String,
                    require: false,
                },
                attach: {
                    type: String,
                    require: false,
                },
            },
            require: false,
            _id: false,
        },
        report: [
            {
                type: reportSchema,
                require: false,
            },
        ],
        comment: {
            type: commentSchema,
            require: false,
        },
        rate: {
            type: {
                comment: {
                    type: String,
                    require: false,
                },
                mark_mid: {
                    type: String,
                    require: false,
                },
                mark_final: {
                    type: String,
                    require: false,
                },
            },
            require: false,
            _id: false,
        },
        research_area: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                    },
                    experience: {
                        type: String,
                        required: true,
                    },
                },
            ],
            required: false,
            _id: false,
        },
        created_by: {
            type: String,
            require: true,
        },
        updated_by: {
            type: String,
            require: false,
        },
        created_time: {
            type: Date,
            require: true,
        },
        updated_time: {
            type: Date,
            require: false,
        },
        is_active: {
            type: Boolean,
            require: true,
            default: true,
        },
    },
    {
        versionKey: false,
    }
);

const Project = mongoose.model<IProject>("projects", projectSchema);
export default Project;
