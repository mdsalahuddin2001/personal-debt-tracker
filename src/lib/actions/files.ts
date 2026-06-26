"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Folder } from "@/models/folder";
import { FileItem } from "@/models/file";
import {
  folderNameSchema,
  fileNameSchema,
  uploadRequestSchema,
} from "@/lib/validations";
import { requireUserId } from "@/lib/auth-helpers";
import { presignUpload, deleteObjects } from "@/lib/r2";
import {
  fail,
  ok,
  okData,
  failData,
  type ActionResult,
  type DataResult,
} from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

/** All image files the user owns, newest first — for the note image picker. */
export async function listImageFiles(): Promise<
  DataResult<{ id: string; name: string }[]>
> {
  const owner = await requireUserId();
  await connectDB();
  const files = await FileItem.find({ owner, contentType: { $regex: "^image/" } })
    .sort({ createdAt: -1 })
    .select("name")
    .lean<{ _id: Types.ObjectId; name: string }[]>();
  return okData(files.map((f) => ({ id: String(f._id), name: f.name })));
}

/** Resolve a destination folder id from the client, validating ownership. */
async function resolveFolderId(
  owner: string,
  folderId: string | null
): Promise<{ ok: true; value: Types.ObjectId | null } | { ok: false }> {
  if (!folderId) return { ok: true, value: null };
  if (!Types.ObjectId.isValid(folderId)) return { ok: false };
  const exists = await Folder.exists({ _id: folderId, owner });
  if (!exists) return { ok: false };
  return { ok: true, value: new Types.ObjectId(folderId) };
}

/** Folder ids of every descendant of `rootId` (excluding rootId itself). */
async function collectDescendantFolderIds(
  owner: string,
  rootId: string
): Promise<string[]> {
  const result: string[] = [];
  const seen = new Set<string>([rootId]);
  let frontier: (string | Types.ObjectId)[] = [rootId];

  while (frontier.length > 0) {
    const children = await Folder.find({ owner, parent: { $in: frontier } })
      .select("_id")
      .lean<{ _id: Types.ObjectId }[]>();
    const next: Types.ObjectId[] = [];
    for (const child of children) {
      const id = String(child._id);
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(id);
      next.push(child._id);
    }
    frontier = next;
  }
  return result;
}

// ----- Folders -----

export async function createFolder(
  values: unknown,
  parentId: string | null
): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = folderNameSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const parent = await resolveFolderId(owner, parentId);
  if (!parent.ok) return fail("Parent folder not found");

  await Folder.create({ owner, name: parsed.data.name, parent: parent.value });

  revalidatePath("/files");
  return ok;
}

export async function renameFolder(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid folder");

  const parsed = folderNameSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const updated = await Folder.findOneAndUpdate(
    { _id: id, owner },
    { $set: { name: parsed.data.name } }
  );
  if (!updated) return fail("Folder not found");

  revalidatePath("/files");
  return ok;
}

export async function deleteFolder(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid folder");

  await connectDB();
  const folder = await Folder.findOne({ _id: id, owner });
  if (!folder) return fail("Folder not found");

  // Gather the whole subtree (this folder + all descendants).
  const descendantIds = await collectDescendantFolderIds(owner, id);
  const allFolderIds = [id, ...descendantIds];

  // Remove the underlying R2 objects for every file in the subtree.
  const files = await FileItem.find({ owner, folder: { $in: allFolderIds } })
    .select("key")
    .lean<{ key: string }[]>();
  const { deleted, failed } = await deleteObjects(files.map((f) => f.key));

  if (failed.length > 0) {
    console.warn(
      `[files] deleteFolder ${id}: ${failed.length} R2 object(s) could not be deleted and are now orphaned:`,
      failed
    );
  }

  const fileResult = await FileItem.deleteMany({
    owner,
    folder: { $in: allFolderIds },
  });
  const folderResult = await Folder.deleteMany({
    owner,
    _id: { $in: allFolderIds },
  });

  console.log(
    `[files] deleteFolder ${id}: folders=${folderResult.deletedCount}, ` +
      `dbFiles=${fileResult.deletedCount}/${files.length}, ` +
      `r2Deleted=${deleted.length}, r2Failed=${failed.length}`
  );

  revalidatePath("/files");
  return ok;
}

export async function moveFolder(
  id: string,
  destFolderId: string | null
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid folder");

  await connectDB();
  const folder = await Folder.findOne({ _id: id, owner });
  if (!folder) return fail("Folder not found");

  const dest = await resolveFolderId(owner, destFolderId);
  if (!dest.ok) return fail("Destination folder not found");

  const destId = dest.value ? String(dest.value) : null;
  if (destId === id) return fail("Can't move a folder into itself");
  if (destId) {
    const descendants = await collectDescendantFolderIds(owner, id);
    if (descendants.includes(destId)) {
      return fail("Can't move a folder into one of its subfolders");
    }
  }

  folder.parent = dest.value;
  await folder.save();

  revalidatePath("/files");
  return ok;
}

// ----- Files -----

export async function requestUpload(
  values: unknown,
  folderId: string | null
): Promise<DataResult<{ key: string; url: string }>> {
  const owner = await requireUserId();

  const parsed = uploadRequestSchema.safeParse(values);
  if (!parsed.success) return failData(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const folder = await resolveFolderId(owner, folderId);
  if (!folder.ok) return failData("Folder not found");

  // Opaque, owner-scoped key. The display name lives in MongoDB, so rename and
  // move never touch R2.
  const key = `${owner}/${randomUUID()}`;
  const url = await presignUpload(key, parsed.data.contentType);

  return okData({ key, url });
}

export async function confirmUpload(
  values: unknown,
  key: string,
  folderId: string | null
): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = uploadRequestSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  // The key must be one we would have minted for this user.
  if (typeof key !== "string" || !key.startsWith(`${owner}/`)) {
    return fail("Invalid upload");
  }

  await connectDB();
  const folder = await resolveFolderId(owner, folderId);
  if (!folder.ok) return fail("Folder not found");

  await FileItem.create({
    owner,
    name: parsed.data.name,
    folder: folder.value,
    key,
    size: parsed.data.size,
    contentType: parsed.data.contentType,
  });

  revalidatePath("/files");
  return ok;
}

export async function renameFile(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid file");

  const parsed = fileNameSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const updated = await FileItem.findOneAndUpdate(
    { _id: id, owner },
    { $set: { name: parsed.data.name } }
  );
  if (!updated) return fail("File not found");

  revalidatePath("/files");
  return ok;
}

export async function deleteFile(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid file");

  await connectDB();
  const file = await FileItem.findOne({ _id: id, owner });
  if (!file) return fail("File not found");

  const { failed } = await deleteObjects([file.key]);
  if (failed.length > 0) {
    console.warn(
      `[files] deleteFile ${id}: R2 object ${file.key} could not be deleted and is now orphaned.`
    );
  }
  await file.deleteOne();

  revalidatePath("/files");
  return ok;
}

export async function moveFile(
  id: string,
  destFolderId: string | null
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid file");

  await connectDB();
  const dest = await resolveFolderId(owner, destFolderId);
  if (!dest.ok) return fail("Destination folder not found");

  const updated = await FileItem.findOneAndUpdate(
    { _id: id, owner },
    { $set: { folder: dest.value } }
  );
  if (!updated) return fail("File not found");

  revalidatePath("/files");
  return ok;
}
