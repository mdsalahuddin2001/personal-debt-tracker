import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

const folderSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this folder.
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    // Parent folder, or null when the folder lives at the root.
    parent: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  },
  { timestamps: true }
);

// Owner-scoped lookups within a parent, sorted by name.
folderSchema.index({ owner: 1, parent: 1, name: 1 });

export type FolderDoc = InferSchemaType<typeof folderSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const Folder: Model<FolderDoc> =
  (models.Folder as Model<FolderDoc>) ||
  model<FolderDoc>("Folder", folderSchema);
