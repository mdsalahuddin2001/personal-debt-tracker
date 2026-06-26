"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Routine } from "@/models/routine";
import { RoutineCategory } from "@/models/routine-category";
import { RoutineLog } from "@/models/routine-log";
import { routineSchema, routineCategorySchema } from "@/lib/validations";
import {
  MAX_ROUTINE_DURATION,
  rangeDurationMinutes,
  todayKey,
} from "@/lib/routine-types";
import { requireUserId } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function revalidateRoutines() {
  revalidatePath("/routines");
  revalidatePath("/routines/all");
}

// Turn a start→end span into stored minutes, capped at the max. Blank end or a
// zero-length span means no duration.
function durationFromRange(start: string, end?: string): number | null {
  if (!end) return null;
  const diff = rangeDurationMinutes(start, end);
  return diff == null ? null : Math.min(diff, MAX_ROUTINE_DURATION);
}

// Dedupe + sort the weekday list so storage is canonical.
function normalizeDays(days: number[]): number[] {
  return [...new Set(days)].sort((a, b) => a - b);
}

// Resolve a category id from the form to an ObjectId (or null), checking that it
// belongs to the user. Returns { ok: false } for a foreign/malformed id.
async function resolveCategoryId(
  owner: string,
  categoryId?: string
): Promise<{ ok: true; value: Types.ObjectId | null } | { ok: false }> {
  if (!categoryId || categoryId === "none") return { ok: true, value: null };
  if (!Types.ObjectId.isValid(categoryId)) return { ok: false };
  const exists = await RoutineCategory.exists({ _id: categoryId, owner });
  if (!exists) return { ok: false };
  return { ok: true, value: new Types.ObjectId(categoryId) };
}

export async function createRoutine(values: unknown): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = routineSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const category = await resolveCategoryId(owner, parsed.data.categoryId);
  if (!category.ok) return fail("Category not found");

  await Routine.create({
    owner,
    title: parsed.data.title,
    description: parsed.data.description || "",
    timeOfDay: parsed.data.timeOfDay,
    days: normalizeDays(parsed.data.days),
    durationMinutes: durationFromRange(
      parsed.data.timeOfDay,
      parsed.data.endTime
    ),
    category: category.value,
  });

  revalidateRoutines();
  return ok;
}

export async function updateRoutine(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid routine");

  const parsed = routineSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const category = await resolveCategoryId(owner, parsed.data.categoryId);
  if (!category.ok) return fail("Category not found");

  const res = await Routine.findOneAndUpdate(
    { _id: id, owner },
    {
      $set: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        timeOfDay: parsed.data.timeOfDay,
        days: normalizeDays(parsed.data.days),
        durationMinutes: durationFromRange(
          parsed.data.timeOfDay,
          parsed.data.endTime
        ),
        category: category.value,
      },
    }
  );
  if (!res) return fail("Routine not found");

  revalidateRoutines();
  return ok;
}

export async function deleteRoutine(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid routine");

  await connectDB();
  const res = await Routine.findOneAndDelete({ _id: id, owner });
  if (!res) return fail("Routine not found");

  // Completion history is meaningless without the routine — clear it too.
  await RoutineLog.deleteMany({ owner, routine: id });

  revalidateRoutines();
  return ok;
}

/**
 * Mark today's occurrence of a routine done or not. "Today" is resolved on the
 * server in the app timezone, so the client never has to be trusted with the
 * date. Toggling done upserts a log row; toggling off deletes it.
 */
export async function setRoutineDone(
  id: string,
  done: boolean
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid routine");

  await connectDB();
  const routine = await Routine.exists({ _id: id, owner });
  if (!routine) return fail("Routine not found");

  const date = todayKey();
  if (done) {
    // Idempotent: a repeated "done" tap shouldn't error on the unique index.
    await RoutineLog.updateOne(
      { owner, routine: id, date },
      { $setOnInsert: { owner, routine: id, date } },
      { upsert: true }
    );
  } else {
    await RoutineLog.deleteOne({ owner, routine: id, date });
  }

  revalidateRoutines();
  return ok;
}

// ----- Categories -----

export async function createRoutineCategory(
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = routineCategorySchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await RoutineCategory.create({
    owner,
    name: parsed.data.name,
    color: parsed.data.color,
  });

  revalidateRoutines();
  return ok;
}

export async function updateRoutineCategory(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid category");

  const parsed = routineCategorySchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const res = await RoutineCategory.findOneAndUpdate(
    { _id: id, owner },
    { $set: { name: parsed.data.name, color: parsed.data.color } }
  );
  if (!res) return fail("Category not found");

  revalidateRoutines();
  return ok;
}

/** Delete a category; its routines fall back to uncategorized. */
export async function deleteRoutineCategory(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid category");

  await connectDB();
  const category = await RoutineCategory.findOne({ _id: id, owner });
  if (!category) return fail("Category not found");

  await Routine.updateMany({ owner, category: id }, { $set: { category: null } });
  await category.deleteOne();

  revalidateRoutines();
  return ok;
}
