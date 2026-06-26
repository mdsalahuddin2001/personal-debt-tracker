import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { NOTE_COLORS, type NoteColor } from "@/lib/note-types";

export { NOTE_COLORS };
export type { NoteColor };

const noteSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this note.
    owner: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    // Rich body as Markdown; rendered on the card.
    content: { type: String, default: "" },
    // Free-form labels, normalized (trimmed, lowercased, deduped) before save.
    tags: { type: [String], default: [] },
    color: {
      type: String,
      enum: NOTE_COLORS,
      required: true,
      default: "default",
    },
    // Pinned notes float to the top of the active board. Archiving clears this.
    pinned: { type: Boolean, default: false },
    // Archived notes leave the main board but are kept (soft hide, not delete).
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Owner-scoped board: active vs. archived split, pinned first, newest first.
noteSchema.index({ owner: 1, archived: 1, pinned: -1, updatedAt: -1 });
// Supports the tag filter without scanning every note.
noteSchema.index({ owner: 1, tags: 1 });

export type NoteDoc = InferSchemaType<typeof noteSchema>;

// Guard against model recompilation during HMR in development.
export const Note: Model<NoteDoc> =
  (models.Note as Model<NoteDoc>) || model<NoteDoc>("Note", noteSchema);
