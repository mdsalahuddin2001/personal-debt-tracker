import { requireSession } from "@/lib/auth-helpers";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSession();

  return (
    <div className="min-h-svh bg-muted/40 md:flex">
      <AppSidebar isAdmin={user.role === "admin"} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8">
        {children}
      </main>
    </div>
  );
}
