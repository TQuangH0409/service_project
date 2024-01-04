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
        semester: {
            type: String,
            require: true,
        },
        student: {
            type: [
                {
                    id: {
                        type: String,
                        required: true,
                    },
                    number: {
                        type: String,
                        required: true,
                    },
                    fullname: {
                        type: String,
                        required: true,
                    },
                    email: {
                        type: String,
                        required: true,
                    },
                    position: {
                        type: String,
                        required: true,
                    },
                    research_area: {
                        type: [
                            {
                                name: {
                                    type: String,
                                    required: false,
                                },
                                number: {
                                    type: String,
                                    required: false,
                                },
                                experience: {
                                    type: String,
                                    required: false,
                                },
                            },
                        ],
                        required: true,
                        _id: false,
                    },
                    school: {
                        type: Number,
                        required: false,
                    },
                    coincidence: {
                        type: Number,
                        required: false,
                    },
                },
            ],
            required: false,
            _id: false,
        },

        teacher: {
            type: {
                id: {
                    type: String,
                    required: true,
                },
                number: {
                    type: String,
                    required: true,
                },
                fullname: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
                position: {
                    type: String,
                    required: true,
                },
                research_area: {
                    type: [
                        {
                            name: {
                                type: String,
                                required: false,
                            },
                            number: {
                                type: String,
                                required: false,
                            },
                            experience: {
                                type: String,
                                required: false,
                            },
                        },
                    ],
                    required: true,
                    _id: false,
                },
                school: {
                    type: Number,
                    required: false,
                },
                coincidence: {
                    type: Number,
                    required: false,
                },
            },

            required: false,
            _id: false,
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
