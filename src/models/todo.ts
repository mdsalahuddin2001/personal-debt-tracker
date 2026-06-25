import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";
import {
  TODO_STATUSES,
  TODO_PRIORITIES,
  type TodoStatus,
  type TodoPriority,
} from "@/lib/todo-types";

export { TODO_STATUSES, TODO_PRIORITIES };
export type { TodoStatus, TodoPriority };

const todoSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this task.
    owner: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: TODO_STATUSES,
      required: true,
      default: "todo",
    },
    priority: {
      type: String,
      enum: TODO_PRIORITIES,
      required: true,
      default: "medium",
    },
    dueDate: { type: Date, default: null },
    // Stamped when status becomes "done"; cleared if reopened. Compared against
    // dueDate to tell on-time completions from late ones.
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Owner-scoped lookups: board/list views and due-date sorted queries.
todoSchema.index({ owner: 1, status: 1 });
todoSchema.index({ owner: 1, dueDate: 1 });

export type TodoDoc = InferSchemaType<typeof todoSchema>;

// Guard against model recompilation during HMR in development.
export const Todo: Model<TodoDoc> =
  (models.Todo as Model<TodoDoc>) || model<TodoDoc>("Todo", todoSchema);
