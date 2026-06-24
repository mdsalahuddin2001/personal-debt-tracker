import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this contact.
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Owner-scoped lookups sorted by name.
contactSchema.index({ owner: 1, name: 1 });

export type ContactDoc = InferSchemaType<typeof contactSchema>;

// Guard against model recompilation during HMR in development.
export const Contact: Model<ContactDoc> =
  (models.Contact as Model<ContactDoc>) ||
  model<ContactDoc>("Contact", contactSchema);
