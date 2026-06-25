"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DotsThreeVertical,
  PencilSimple,
  PushPin,
  PushPinSlash,
  Archive,
  ArrowCounterClockwise,
  Trash,
} from "@/components/icons";
import {
  setNotePinned,
  setNoteArchived,
  deleteNote,
} from "@/lib/actions/notes";
import type { SerializedNote } from "@/lib/queries";
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
import { NoteForm } from "./note-form";

export function NoteActions({ note }: { note: SerializedNote }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // The edit form and the delete confirm each render their own dialog; the
  // dropdown only toggles which (if any) is open.
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function run(action: () => Promise<{ success: boolean; error?: string }>, ok: string) {
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
            aria-label="Note actions"
            disabled={pending}
          >
            <DotsThreeVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilSimple className="size-4" /> Edit
          </DropdownMenuItem>
          {!note.archived &&
            (note.pinned ? (
              <DropdownMenuItem
                onSelect={() => run(() => setNotePinned(note.id, false), "Unpinned")}
              >
                <PushPinSlash className="size-4" /> Unpin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={() => run(() => setNotePinned(note.id, true), "Pinned")}
              >
                <PushPin className="size-4" /> Pin
              </DropdownMenuItem>
            ))}
          {note.archived ? (
            <DropdownMenuItem
              onSelect={() => run(() => setNoteArchived(note.id, false), "Restored")}
            >
              <ArrowCounterClockwise className="size-4" /> Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => run(() => setNoteArchived(note.id, true), "Archived")}
            >
              <Archive className="size-4" /> Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open so it re-reads the note's values each time. */}
      {editOpen && (
        <NoteForm note={note} open onOpenChange={setEditOpen} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>
              &ldquo;{note.title}&rdquo; will be permanently deleted. This
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
                  const res = await deleteNote(note.id);
                  if (res.success) setDeleteOpen(false);
                  return res;
                }, "Note deleted")
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
