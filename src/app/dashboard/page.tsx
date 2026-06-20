import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-svh bg-muted/40 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name}
            </p>
          </div>
          <SignOutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your admin account details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <div>
              <span className="text-muted-foreground">Name: </span>
              {session.user.name}
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              {session.user.email}
            </div>
            <div>
              <span className="text-muted-foreground">Role: </span>
              {session.user.role ?? "admin"}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
