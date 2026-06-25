// Color labels a note can carry, used for at-a-glance grouping on the board.
// Kept in its own module so both the Mongoose model and the Zod validations can
// share the literals without a server-only import leaking into client bundles.
export const NOTE_COLORS = [
  "default",
  "red",
  "amber",
  "green",
  "blue",
  "purple",
] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

// Hard caps mirrored by the Zod schema and the model — kept here so the form,
// the action, and the schema all agree on the same limits.
export const MAX_NOTE_TAGS = 12;
export const MAX_NOTE_TAG_LENGTH = 30;
