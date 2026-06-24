"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction } from "@/models/transaction";
import { contactSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

export async function createContact(values: unknown): Promise<ActionResult> {
  await requireSession();

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await Contact.create({
    name: parsed.data.name,
    phone: parsed.data.phone || undefined,
    relationship: parsed.data.relationship || undefined,
    notes: parsed.data.notes || undefined,
  });

  revalidatePath("/hishab-nikash/contacts");
  revalidatePath("/hishab-nikash/summary");
  return ok;
}

export async function updateContact(
  id: string,
  values: unknown
): Promise<ActionResult> {
  await requireSession();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid contact");

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  await connectDB();
  await Contact.findByIdAndUpdate(id, {
    $set: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      relationship: parsed.data.relationship || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/hishab-nikash/contacts");
  revalidatePath(`/hishab-nikash/contacts/${id}`);
  revalidatePath("/hishab-nikash/summary");
  return ok;
}

export async function deleteContact(id: string): Promise<ActionResult> {
  await requireSession();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid contact");

  await connectDB();
  // Remove the contact's transactions first so no orphans remain.
  await Transaction.deleteMany({ contact: id });
  await Contact.findByIdAndDelete(id);

  revalidatePath("/hishab-nikash/contacts");
  revalidatePath("/hishab-nikash/summary");
  revalidatePath("/hishab-nikash/transactions");
  return ok;
}
