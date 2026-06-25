import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

const linkSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this link.
    owner: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    // Stored with a protocol (normalized in the action before save).
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    // Free-form labels, normalized (trimmed, lowercased, deduped) before save.
    tags: { type: [String], default: [] },
    // Owning category, or null when the link is uncategorized.
    folder: { type: Schema.Types.ObjectId, ref: "LinkFolder", default: null },
  },
  { timestamps: true }
);

// Owner-scoped board within a folder, newest first.
linkSchema.index({ owner: 1, folder: 1, updatedAt: -1 });
// Supports the tag filter without scanning every link.
linkSchema.index({ owner: 1, tags: 1 });

export type LinkDoc = InferSchemaType<typeof linkSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const Link: Model<LinkDoc> =
  (models.Link as Model<LinkDoc>) || model<LinkDoc>("Link", linkSchema);
