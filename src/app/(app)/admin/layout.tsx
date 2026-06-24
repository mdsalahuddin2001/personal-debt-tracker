import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guards the entire /admin subtree — non-admins are redirected to /dashboard.
  await requireAdmin();
  return <>{children}</>;
}
