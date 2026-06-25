"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Todo } from "@/models/todo";
import { todoSchema } from "@/lib/validations";
import { TODO_STATUSES, type TodoStatus } from "@/lib/todo-types";
import { requireUserId } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function revalidateTodos() {
  revalidatePath("/todos/summary");
  revalidatePath("/todos/tasks");
}

// Parse the form's due-date string into a Date, or null when left blank.
function parseDueDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createTodo(values: unknown): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = todoSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await Todo.create({
    owner,
    title: parsed.data.title,
    description: parsed.data.description || undefined,
    status: parsed.data.status,
    priority: parsed.data.priority,
    dueDate: parseDueDate(parsed.data.dueDate),
    // A task created directly as "done" is completed now.
    completedAt: parsed.data.status === "done" ? new Date() : null,
  });

  revalidateTodos();
  return ok;
}

export async function updateTodo(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid task");

  const parsed = todoSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const existing = await Todo.findOne({ _id: id, owner })
    .select("status completedAt")
    .lean<{ status: TodoStatus; completedAt: Date | null }>();
  if (!existing) return fail("Task not found");

  // Preserve the original completion time when a task stays done; stamp a fresh
  // one when it transitions into done; clear it when reopened.
  let completedAt: Date | null;
  if (parsed.data.status === "done") {
    completedAt =
      existing.status === "done" && existing.completedAt
        ? existing.completedAt
        : new Date();
  } else {
    completedAt = null;
  }

  await Todo.findOneAndUpdate(
    { _id: id, owner },
    {
      $set: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        status: parsed.data.status,
        priority: parsed.data.priority,
        dueDate: parseDueDate(parsed.data.dueDate),
        completedAt,
      },
    }
  );

  revalidateTodos();
  return ok;
}

/** Quick status change from the list/board without opening the full form. */
export async function setTodoStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid task");
  if (!TODO_STATUSES.includes(status as TodoStatus))
    return fail("Invalid status");

  await connectDB();
  const existing = await Todo.findOne({ _id: id, owner })
    .select("status completedAt")
    .lean<{ status: TodoStatus; completedAt: Date | null }>();
  if (!existing) return fail("Task not found");

  let completedAt: Date | null;
  if (status === "done") {
    completedAt =
      existing.status === "done" && existing.completedAt
        ? existing.completedAt
        : new Date();
  } else {
    completedAt = null;
  }

  await Todo.findOneAndUpdate(
    { _id: id, owner },
    { $set: { status, completedAt } }
  );

  revalidateTodos();
  return ok;
}

export async function deleteTodo(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid task");

  await connectDB();
  await Todo.findOneAndDelete({ _id: id, owner });

  revalidateTodos();
  return ok;
}
