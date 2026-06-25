"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Note } from "@/models/note";
import { noteSchema } from "@/lib/validations";
import { MAX_NOTE_TAGS, MAX_NOTE_TAG_LENGTH } from "@/lib/note-types";
import { requireUserId } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function revalidateNotes() {
  revalidatePath("/notes");
  revalidatePath("/notes/archive");
}

// Turn the form's comma-separated tag string into a clean, deduped list:
// trimmed, lowercased, blank-free, length-capped per tag and count-capped.
function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase().slice(0, MAX_NOTE_TAG_LENGTH);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_NOTE_TAGS) break;
  }
  return out;
}

export async function createNote(values: unknown): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = noteSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await Note.create({
    owner,
    title: parsed.data.title,
    description: parsed.data.description || "",
    color: parsed.data.color,
    tags: parseTags(parsed.data.tags),
  });

  revalidateNotes();
  return ok;
}

export async function updateNote(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid note");

  const parsed = noteSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const res = await Note.findOneAndUpdate(
    { _id: id, owner },
    {
      $set: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        color: parsed.data.color,
        tags: parseTags(parsed.data.tags),
      },
    }
  );
  if (!res) return fail("Note not found");

  revalidateNotes();
  return ok;
}

/** Pin or unpin from the card menu without opening the full form. */
export async function setNotePinned(
  id: string,
  pinned: boolean
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid note");

  await connectDB();
  const res = await Note.findOneAndUpdate(
    { _id: id, owner },
    { $set: { pinned } }
  );
  if (!res) return fail("Note not found");

  revalidateNotes();
  return ok;
}

/** Archive or restore. Archiving also clears the pin so the board stays tidy. */
export async function setNoteArchived(
  id: string,
  archived: boolean
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid note");

  await connectDB();
  const res = await Note.findOneAndUpdate(
    { _id: id, owner },
    { $set: archived ? { archived: true, pinned: false } : { archived: false } }
  );
  if (!res) return fail("Note not found");

  revalidateNotes();
  return ok;
}

export async function deleteNote(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid note");

  await connectDB();
  await Note.findOneAndDelete({ _id: id, owner });

  revalidateNotes();
  return ok;
}
