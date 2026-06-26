"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "@/components/icons";
import { setRoutineDone } from "@/lib/actions/routines";
import { cn } from "@/lib/utils";

/** Tap-to-complete control for today's occurrence of a routine. Flips state
 * optimistically, then reconciles against the server. */
export function RoutineToggle({
  id,
  done,
  title,
}: {
  id: string;
  done: boolean;
  title: string;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(done);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const res = await setRoutineDone(id, next);
      if (res.success) {
        router.refresh();
      } else {
        setOptimistic(!next); // roll back
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? `Mark ${title} not done` : `Mark ${title} done`}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-60",
        optimistic
          ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
          : "border-muted-foreground/30 text-transparent hover:border-green-600/60 hover:text-green-600/40"
      )}
    >
      <Check weight="bold" className="size-4" />
    </button>
  );
}
