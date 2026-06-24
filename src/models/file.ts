import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

const fileSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this file.
    owner: { type: String, required: true, index: true },
    // Display name (with extension). Renaming only changes this, not the R2 key.
    name: { type: String, required: true, trim: true },
    // Containing folder, or null when the file lives at the root.
    folder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    // Opaque R2 object key, e.g. "<owner>/<uuid>". Stable across rename/move.
    key: { type: String, required: true, unique: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: true }
);

// Owner-scoped lookups within a folder, sorted by name.
fileSchema.index({ owner: 1, folder: 1, name: 1 });

export type FileDoc = InferSchemaType<typeof fileSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const FileItem: Model<FileDoc> =
  (models.File as Model<FileDoc>) || model<FileDoc>("File", fileSchema);
