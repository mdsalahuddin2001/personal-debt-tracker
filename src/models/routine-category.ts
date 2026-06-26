import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";
import { ROUTINE_COLORS, type RoutineColor } from "@/lib/routine-types";

export { ROUTINE_COLORS };
export type { RoutineColor };

// A user-defined grouping for routines (e.g. Health, Work, Study), carrying a
// color used to tint its routines across the views. Flat — no nesting.
const routineCategorySchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this category.
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: {
      type: String,
      enum: ROUTINE_COLORS,
      required: true,
      default: "slate",
    },
  },
  { timestamps: true }
);

routineCategorySchema.index({ owner: 1, name: 1 });

export type RoutineCategoryDoc = InferSchemaType<typeof routineCategorySchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const RoutineCategory: Model<RoutineCategoryDoc> =
  (models.RoutineCategory as Model<RoutineCategoryDoc>) ||
  model<RoutineCategoryDoc>("RoutineCategory", routineCategorySchema);
