"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction } from "@/models/transaction";
import {
  createUserSchema,
  resetPasswordSchema,
  USER_ROLES,
  type UserRole,
} from "@/lib/validations";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

function firstError(message?: string): string {
  return message ?? "Invalid input";
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message) || "Something went wrong";
  }
  return "Something went wrong";
}

export async function createUserAction(values: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        name: parsed.data.name,
        role: parsed.data.role,
      },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}

export async function setUserRoleAction(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (!userId) return fail("Invalid user");
  if (!USER_ROLES.includes(role)) return fail("Invalid role");
  if (userId === user.id) return fail("You can't change your own role");

  try {
    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}

export async function banUserAction(
  userId: string,
  banReason?: string
): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (!userId) return fail("Invalid user");
  if (userId === user.id) return fail("You can't ban yourself");

  try {
    await auth.api.banUser({
      headers: await headers(),
      body: { userId, banReason: banReason || undefined },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}

export async function unbanUserAction(userId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!userId) return fail("Invalid user");

  try {
    await auth.api.unbanUser({
      headers: await headers(),
      body: { userId },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}

export async function resetPasswordAction(
  userId: string,
  values: unknown
): Promise<ActionResult> {
  await requireAdmin();
  if (!userId) return fail("Invalid user");

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return fail(firstError(parsed.error.issues[0]?.message));

  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId, newPassword: parsed.data.newPassword },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (!userId) return fail("Invalid user");
  if (userId === user.id) return fail("You can't delete yourself");

  // Refuse to delete while the user still owns data, to avoid orphaning it.
  await connectDB();
  const [hasContacts, hasTxns] = await Promise.all([
    Contact.exists({ owner: userId }),
    Transaction.exists({ owner: userId }),
  ]);
  if (hasContacts || hasTxns) {
    return fail(
      "This user still owns contacts or transactions. Remove their data first."
    );
  }

  try {
    await auth.api.removeUser({
      headers: await headers(),
      body: { userId },
    });
  } catch (err) {
    return fail(errorMessage(err));
  }

  revalidatePath("/admin/users");
  return ok;
}
