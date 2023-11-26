import mongoose from "mongoose";
import { IResearchArea } from "../interfaces/models/research_areas";

const research_areaSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            require: true,
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

const ResearchArea = mongoose.model<IResearchArea>(
    "research_areas",
    research_areaSchema
);
export default ResearchArea;
