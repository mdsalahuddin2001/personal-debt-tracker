import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

// A flat category for grouping links. Unlike the Files folder, link folders
// don't nest — there's no parent, just an owner-scoped name.
const linkFolderSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this folder.
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Owner-scoped lookups, sorted by name.
linkFolderSchema.index({ owner: 1, name: 1 });

export type LinkFolderDoc = InferSchemaType<typeof linkFolderSchema> & {
  _id: Types.ObjectId;
};

// Guard against model recompilation during HMR in development.
export const LinkFolder: Model<LinkFolderDoc> =
  (models.LinkFolder as Model<LinkFolderDoc>) ||
  model<LinkFolderDoc>("LinkFolder", linkFolderSchema);
