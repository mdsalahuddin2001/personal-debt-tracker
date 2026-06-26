"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DotsThreeVertical, PencilSimple, Trash } from "@/components/icons";
import { deleteRoutineCategory } from "@/lib/actions/routines";
import type { RoutineCategoryEntry } from "@/lib/queries";
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
import { CategoryForm } from "./category-form";

export function CategoryActions({
  category,
  /** Whether this category is the one currently being viewed. */
  isActive,
}: {
  category: RoutineCategoryEntry;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function onDelete() {
    startTransition(async () => {
      const res = await deleteRoutineCategory(category.id);
      if (res.success) {
        toast.success("Category deleted");
        setDeleteOpen(false);
        // The viewed category is gone — fall back to the full board.
        if (isActive) router.push("/routines/all");
        else router.refresh();
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
            className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label={`${category.name} actions`}
            onClick={(e) => e.preventDefault()}
          >
            <DotsThreeVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilSimple className="size-4" /> Edit
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

      {editOpen && (
        <CategoryForm category={category} open onOpenChange={setEditOpen} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              &ldquo;{category.name}&rdquo; will be deleted.{" "}
              {category.count > 0
                ? `Its ${category.count} routine${category.count === 1 ? "" : "s"} will become uncategorized.`
                : "It has no routines."}
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
            <Button variant="destructive" disabled={pending} onClick={onDelete}>
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
