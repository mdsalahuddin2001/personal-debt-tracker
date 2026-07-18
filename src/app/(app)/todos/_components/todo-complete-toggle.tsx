"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Circle, CircleNotch } from "@/components/icons";
import { setTodoStatus } from "@/lib/actions/todos";
import type { TodoStatus } from "@/lib/todo-types";
import { cn } from "@/lib/utils";

/** The signature todo interaction: tap the ring to complete a task, tap again
 * to reopen it. Completing sets "done"; reopening returns it to "to-do". */
export function TodoCompleteToggle({
  id,
  status,
  title,
}: {
  id: string;
  status: TodoStatus;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const done = status === "done";

  function onToggle() {
    startTransition(async () => {
      const res = await setTodoStatus(id, done ? "todo" : "done");
      if (res.success) router.refresh();
      else toast.error(res.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={done}
      aria-label={done ? `Reopen ${title}` : `Complete ${title}`}
      className={cn(
        "shrink-0 rounded-full text-muted-foreground transition-colors",
        "hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        done && "text-green-600 hover:text-green-600 dark:text-green-400"
      )}
    >
      {pending ? (
        <CircleNotch className="size-6 animate-spin" />
      ) : done ? (
        <CheckCircle weight="fill" className="size-6" />
      ) : (
        <Circle className="size-6" />
      )}
    </button>
  );
}
