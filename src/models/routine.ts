import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

// A recurring daily activity. It runs at `timeOfDay` on the weekdays listed in
// `days` (0 = Sunday … 6 = Saturday). Completions live in their own RoutineLog
// collection so a routine stays a lightweight template.
const routineSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this routine.
    owner: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    // "HH:MM" in 24-hour time; sorts the routine and picks its day period.
    timeOfDay: { type: String, required: true },
    // Weekdays the routine runs on (0–6). At least one, enforced by the action.
    days: { type: [Number], default: [] },
    // Optional planned length in minutes; null when not tracked.
    durationMinutes: { type: Number, default: null },
    // Owning category, or null when uncategorized.
    category: { type: Schema.Types.ObjectId, ref: "RoutineCategory", default: null },
  },
  { timestamps: true }
);

// Owner-scoped board, ordered by time of day; and category-filtered lookups.
routineSchema.index({ owner: 1, timeOfDay: 1 });
routineSchema.index({ owner: 1, category: 1 });

export type RoutineDoc = InferSchemaType<typeof routineSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const Routine: Model<RoutineDoc> =
  (models.Routine as Model<RoutineDoc>) ||
  model<RoutineDoc>("Routine", routineSchema);
