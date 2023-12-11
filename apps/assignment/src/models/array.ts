import mongoose, { Schema } from "mongoose";
import { v1 } from "uuid";
import { ETYPEARRAY, IArray } from "../interfaces/models/assignment";

interface MyDocument extends Document {
    id: string;
    array: ElementType[][];
  }
  
  type ElementType = string | number;
  
  const arraySchema = new Schema<MyDocument>(
    {
      id: {
        type: String,
        enum: ETYPEARRAY,
        required: true,
      },
      array: {
        type: [
          [
            {
              type: Schema.Types.Mixed,
              required: true,
            },
          ]
        ],
        required: true,
      },
    },
    {
      versionKey: false,
    }
  );

const Array = mongoose.model<MyDocument>("Arrays", arraySchema);
export default Array;
