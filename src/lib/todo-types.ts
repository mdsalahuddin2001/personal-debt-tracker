// Task status workflow: open work starts as "todo", may move to "in_progress",
// and finishes as "done" (which stamps completedAt). Kept in its own module so
// both the Mongoose model and the Zod validations can share the literals
// without a server-only import leaking into client bundles.
export const TODO_STATUSES = ["todo", "in_progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_PRIORITIES = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];
