"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Link } from "@/models/link";
import { LinkFolder } from "@/models/link-folder";
import { linkSchema, linkFolderSchema } from "@/lib/validations";
import {
  MAX_LINK_TAGS,
  MAX_LINK_TAG_LENGTH,
  normalizeUrl,
} from "@/lib/link-types";
import { requireUserId } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function revalidateLinks() {
  revalidatePath("/links");
}

// Turn the form's comma-separated tag string into a clean, deduped list:
// trimmed, lowercased, blank-free, length-capped per tag and count-capped.
function parseTags(raw?: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase().slice(0, MAX_LINK_TAG_LENGTH);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_LINK_TAGS) break;
  }
  return out;
}

/** Resolve a folder id from the client to a stored value, validating ownership.
 * "", "none", or null all mean uncategorized. */
async function resolveFolderId(
  owner: string,
  folderId: string | null | undefined
): Promise<{ ok: true; value: Types.ObjectId | null } | { ok: false }> {
  if (!folderId || folderId === "none") return { ok: true, value: null };
  if (!Types.ObjectId.isValid(folderId)) return { ok: false };
  const exists = await LinkFolder.exists({ _id: folderId, owner });
  if (!exists) return { ok: false };
  return { ok: true, value: new Types.ObjectId(folderId) };
}

// ----- Links -----

export async function createLink(values: unknown): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = linkSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const folder = await resolveFolderId(owner, parsed.data.folderId);
  if (!folder.ok) return fail("Folder not found");

  await Link.create({
    owner,
    title: parsed.data.title,
    url: normalizeUrl(parsed.data.url),
    description: parsed.data.description || "",
    tags: parseTags(parsed.data.tags),
    folder: folder.value,
  });

  revalidateLinks();
  return ok;
}

export async function updateLink(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid link");

  const parsed = linkSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const folder = await resolveFolderId(owner, parsed.data.folderId);
  if (!folder.ok) return fail("Folder not found");

  const res = await Link.findOneAndUpdate(
    { _id: id, owner },
    {
      $set: {
        title: parsed.data.title,
        url: normalizeUrl(parsed.data.url),
        description: parsed.data.description || "",
        tags: parseTags(parsed.data.tags),
        folder: folder.value,
      },
    }
  );
  if (!res) return fail("Link not found");

  revalidateLinks();
  return ok;
}

/** Move a link to another folder (or to uncategorized) from the card menu. */
export async function moveLink(
  id: string,
  destFolderId: string | null
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid link");

  await connectDB();
  const folder = await resolveFolderId(owner, destFolderId);
  if (!folder.ok) return fail("Destination folder not found");

  const res = await Link.findOneAndUpdate(
    { _id: id, owner },
    { $set: { folder: folder.value } }
  );
  if (!res) return fail("Link not found");

  revalidateLinks();
  return ok;
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid link");

  await connectDB();
  await Link.findOneAndDelete({ _id: id, owner });

  revalidateLinks();
  return ok;
}

// ----- Folders -----

export async function createLinkFolder(values: unknown): Promise<ActionResult> {
  const owner = await requireUserId();

  const parsed = linkFolderSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await LinkFolder.create({ owner, name: parsed.data.name });

  revalidateLinks();
  return ok;
}

export async function renameLinkFolder(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid folder");

  const parsed = linkFolderSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  const updated = await LinkFolder.findOneAndUpdate(
    { _id: id, owner },
    { $set: { name: parsed.data.name } }
  );
  if (!updated) return fail("Folder not found");

  revalidateLinks();
  return ok;
}

/** Delete a folder. Its links aren't deleted — they fall back to uncategorized. */
export async function deleteLinkFolder(id: string): Promise<ActionResult> {
  const owner = await requireUserId();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid folder");

  await connectDB();
  const folder = await LinkFolder.findOne({ _id: id, owner });
  if (!folder) return fail("Folder not found");

  await Link.updateMany({ owner, folder: id }, { $set: { folder: null } });
  await folder.deleteOne();

  revalidateLinks();
  return ok;
}
