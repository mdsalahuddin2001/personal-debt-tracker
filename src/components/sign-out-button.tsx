"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="w-full justify-start"
    >
      <SignOut className="size-4" />
      <span>Sign out</span>
    </Button>
  );
}
