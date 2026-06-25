"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setTodoStatus } from "@/lib/actions/todos";
import { STATUS_OPTIONS } from "@/lib/todo-constants";
import type { TodoStatus } from "@/lib/todo-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Inline status changer used in the task list — updates without opening the
 * full edit form. */
export function TodoStatusSelect({
  id,
  status,
}: {
  id: string;
  status: TodoStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    if (next === status) return;
    startTransition(async () => {
      const res = await setTodoStatus(id, next);
      if (res.success) {
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
