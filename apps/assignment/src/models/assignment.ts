import mongoose from "mongoose";
import { v1 } from "uuid";
import { ETYPE, IAssignment } from "../interfaces/models/assignment";

const assignmentSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            require: true,
            default: v1(),
        },
        type: {
            type: String,
            require: true,
            enum: ETYPE,
        },
        student: {
            type: [
                {
                    id: {
                        type: String,
                        required: true,
                    },
                    coincidence: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            required: false,
            _id: false,
        },

        teacher: {
            type: String,
            require: false,
        },
        project: {
            type: [
                {
                    id: {
                        type: String,
                        required: true,
                    },
                    coincidence: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            required: false,
            _id: false,
        },

        created_time: {
            type: Date,
            require: false,
        },
        created_by: {
            type: String,
            require: false,
        },
    },
    {
        versionKey: false,
    }
);

const Assignment = mongoose.model<IAssignment>("Assignments", assignmentSchema);
export default Assignment;
