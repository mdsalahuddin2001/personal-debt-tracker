import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Returns the current session, redirecting to /login when unauthenticated.
 * Use in protected server components and server actions.
 */
export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

/** Returns the current user's id, redirecting to /login when unauthenticated. */
export async function requireUserId(): Promise<string> {
  const { user } = await requireSession();
  return user.id;
}

/**
 * Like requireSession, but additionally requires the admin role. Non-admins are
 * sent to /dashboard. Use to guard the admin user-management area.
 */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}
