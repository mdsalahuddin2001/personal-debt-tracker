import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export type ContactDoc = InferSchemaType<typeof contactSchema>;

// Guard against model recompilation during HMR in development.
export const Contact: Model<ContactDoc> =
  (models.Contact as Model<ContactDoc>) ||
  model<ContactDoc>("Contact", contactSchema);
