"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction } from "@/models/transaction";
import { transactionSchema } from "@/lib/validations";
import { requireSession } from "@/lib/auth-helpers";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function revalidateTxn(...contactIds: (string | undefined)[]) {
  revalidatePath("/hishab-nikash/summary");
  revalidatePath("/hishab-nikash/transactions");
  revalidatePath("/hishab-nikash/contacts");
  for (const id of contactIds) {
    if (id) revalidatePath(`/hishab-nikash/contacts/${id}`);
  }
}

export async function createTransaction(
  values: unknown
): Promise<ActionResult> {
  await requireSession();

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));
  if (!Types.ObjectId.isValid(parsed.data.contactId))
    return fail("Invalid contact");

  await connectDB();
  const contactExists = await Contact.exists({ _id: parsed.data.contactId });
  if (!contactExists) return fail("Contact not found");

  await Transaction.create({
    contact: parsed.data.contactId,
    type: parsed.data.type,
    amount: round2(Number(parsed.data.amount)),
    date: new Date(parsed.data.date),
    note: parsed.data.note || undefined,
  });

  revalidateTxn(parsed.data.contactId);
  return ok;
}

export async function updateTransaction(
  id: string,
  values: unknown
): Promise<ActionResult> {
  await requireSession();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid transaction");

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));
  if (!Types.ObjectId.isValid(parsed.data.contactId))
    return fail("Invalid contact");

  await connectDB();
  const existing = await Transaction.findById(id).select("contact").lean<{
    contact: Types.ObjectId;
  }>();
  if (!existing) return fail("Transaction not found");

  await Transaction.findByIdAndUpdate(id, {
    $set: {
      contact: parsed.data.contactId,
      type: parsed.data.type,
      amount: round2(Number(parsed.data.amount)),
      date: new Date(parsed.data.date),
      note: parsed.data.note || null,
    },
  });

  revalidateTxn(String(existing.contact), parsed.data.contactId);
  return ok;
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await requireSession();
  if (!Types.ObjectId.isValid(id)) return fail("Invalid transaction");

  await connectDB();
  const existing = await Transaction.findByIdAndDelete(id).select("contact").lean<{
    contact: Types.ObjectId;
  }>();

  revalidateTxn(existing ? String(existing.contact) : undefined);
  return ok;
}
