"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Archive,
  ArrowCounterClockwise,
} from "@/components/icons";
import { deleteTodo, setTodoArchived } from "@/lib/actions/todos";
import type { SerializedTodo } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TodoForm } from "./todo-form";

/** Per-row ⋯ menu: Edit opens the task form (which doubles as the details
 * view); Delete confirms, then removes the task. */
export function TodoRowActions({ todo }: { todo: SerializedTodo }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function onDelete() {
    startTransition(async () => {
      const res = await deleteTodo(todo.id);
      if (res.success) {
        toast.success("Task deleted");
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  function onToggleArchive() {
    startTransition(async () => {
      const res = await setTodoArchived(todo.id, !todo.archived);
      if (res.success) {
        toast.success(todo.archived ? "Task restored" : "Task archived");
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground"
            aria-label={`Actions for ${todo.title}`}
          >
            <DotsThreeVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilSimple className="size-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onToggleArchive} disabled={pending}>
            {todo.archived ? (
              <>
                <ArrowCounterClockwise className="size-4" /> Restore
              </>
            ) : (
              <>
                <Archive className="size-4" /> Archive
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open so the form re-reads the task each time. */}
      {editOpen && <TodoForm todo={todo} open onOpenChange={setEditOpen} />}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              &ldquo;{todo.title}&rdquo; will be permanently deleted. This
              can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={pending}>
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
