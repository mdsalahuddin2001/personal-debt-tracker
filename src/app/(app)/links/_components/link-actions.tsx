"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DotsThreeVertical,
  PencilSimple,
  ArrowsOutCardinal,
  Check,
  Trash,
} from "@/components/icons";
import { moveLink, deleteLink } from "@/lib/actions/links";
import type { SerializedLink, LinkFolderOption } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { cn } from "@/lib/utils";
import { LinkForm } from "./link-form";

export function LinkActions({
  link,
  folders,
}: {
  link: SerializedLink;
  folders: LinkFolderOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function run(
    action: () => Promise<{ success: boolean; error?: string }>,
    ok: string
  ) {
    startTransition(async () => {
      const res = await action();
      if (res.success) {
        toast.success(ok);
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
            className="size-7 text-muted-foreground"
            aria-label="Link actions"
            disabled={pending}
          >
            <DotsThreeVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilSimple className="size-4" /> Edit
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowsOutCardinal className="size-4" /> Move to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
              <DropdownMenuItem
                disabled={link.folderId === null}
                onSelect={() =>
                  run(() => moveLink(link.id, null), "Moved to Uncategorized")
                }
              >
                <Check
                  className={cn(
                    "size-4",
                    link.folderId === null ? "opacity-100" : "opacity-0"
                  )}
                />
                Uncategorized
              </DropdownMenuItem>
              {folders.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  disabled={link.folderId === f.id}
                  onSelect={() =>
                    run(() => moveLink(link.id, f.id), `Moved to ${f.name}`)
                  }
                >
                  <Check
                    className={cn(
                      "size-4",
                      link.folderId === f.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open so it re-reads the link's values each time. */}
      {editOpen && (
        <LinkForm link={link} folders={folders} open onOpenChange={setEditOpen} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete link?</DialogTitle>
            <DialogDescription>
              &ldquo;{link.title}&rdquo; will be permanently deleted. This
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
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await deleteLink(link.id);
                  if (res.success) setDeleteOpen(false);
                  return res;
                }, "Link deleted")
              }
            >
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
