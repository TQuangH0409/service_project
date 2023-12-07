import mongoose from "mongoose";
import { IUser } from "../interfaces/models";

const userSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        fullname: {
            type: String,
            required: false,
        },
        number: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: false,
        },
        position: {
            type: String,
            required: false,
        },
        is_active: {
            type: Boolean,
            required: false,
            default: true,
        },
        avatar: {
            type: String,
            required: false,
        },
        cccd: {
            type: String,
            required: false,
        },
        class: {
            type: String,
            required: false,
        },
        school: {
            type: String,
            required: false,
        },
        gen: {
            type: String,
            required: false,
        },
        degree: {
            type: String,
            required: false,
        },
        research_area: {
            type: [
                {
                    number: {
                        type: String,
                        required: true,
                    },
                    experience: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            required: false,
            _id: false,
        },
        updated_time: {
            type: Date,
            required: false,
        },
        created_time: {
            type: Date,
            required: true,
        },
        created_by: {
            type: String,
            required: true,
        },
        activities: {
            type: [
                {
                    actor: {
                        type: String,
                        required: true,
                    },
                    action: {
                        type: String,
                        required: true,
                        enum: [
                            "CREATE",
                            "UPDATE",
                            "RESET_PASSWORD",
                            "UPDATE_PASSWORD",
                        ],
                    },
                    time: {
                        type: Date,
                        required: true,
                    },
                    note: {
                        type: String,
                        required: false,
                    },
                },
            ],
            required: true,
            _id: false,
        },
    },
    {
        versionKey: false,
    }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
