import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

// One row per routine per day it was completed. The row's existence *is* the
// completion — toggling off deletes it. `date` is a calendar-date key
// ("YYYY-MM-DD") resolved in the app timezone (see routine-types).
const routineLogSchema = new Schema(
  {
    owner: { type: String, required: true, index: true },
    routine: { type: Schema.Types.ObjectId, ref: "Routine", required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

// One completion per routine per day; also the lookup for the toggle's upsert.
routineLogSchema.index({ owner: 1, routine: 1, date: 1 }, { unique: true });
// Streak/history scans for an owner over a date range.
routineLogSchema.index({ owner: 1, date: 1 });

export type RoutineLogDoc = InferSchemaType<typeof routineLogSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const RoutineLog: Model<RoutineLogDoc> =
  (models.RoutineLog as Model<RoutineLogDoc>) ||
  model<RoutineLogDoc>("RoutineLog", routineLogSchema);
