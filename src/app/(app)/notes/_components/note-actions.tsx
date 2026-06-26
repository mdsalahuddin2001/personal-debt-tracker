"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from "./note-form";
import { NoteView } from "./note-view";

export function NoteActions({ note }: { note: SerializedNote }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewOpen, setViewOpen] = useState(false);
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
      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton
          label="View"
          disabled={pending}
          onClick={() => setViewOpen(true)}
        >
          <Eye className="size-4" />
        </IconButton>

        {!note.archived &&
          (note.pinned ? (
            <IconButton
              label="Unpin"
              disabled={pending}
              onClick={() => run(() => setNotePinned(note.id, false), "Unpinned")}
            >
              <PushPinSlash className="size-4" />
            </IconButton>
          ) : (
            <IconButton
              label="Pin"
              disabled={pending}
              onClick={() => run(() => setNotePinned(note.id, true), "Pinned")}
            >
              <PushPin className="size-4" />
            </IconButton>
          ))}

        <IconButton
          label="Edit"
          disabled={pending}
          onClick={() => setEditOpen(true)}
        >
          <PencilSimple className="size-4" />
        </IconButton>

        {note.archived ? (
          <IconButton
            label="Restore"
            disabled={pending}
            onClick={() => run(() => setNoteArchived(note.id, false), "Restored")}
          >
            <ArrowCounterClockwise className="size-4" />
          </IconButton>
        ) : (
          <IconButton
            label="Archive"
            disabled={pending}
            onClick={() => run(() => setNoteArchived(note.id, true), "Archived")}
          >
            <Archive className="size-4" />
          </IconButton>
        )}

        <IconButton
          label="Delete"
          disabled={pending}
          destructive
          onClick={() => setDeleteOpen(true)}
        >
          <Trash className="size-4" />
        </IconButton>
      </div>

      <NoteView note={note} open={viewOpen} onOpenChange={setViewOpen} />

      {/* Mounted only while open so it re-reads the note's values each time. */}
      {editOpen && <NoteForm note={note} open onOpenChange={setEditOpen} />}

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

function IconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={
        destructive
          ? "size-7 text-muted-foreground hover:text-destructive"
          : "size-7 text-muted-foreground"
      }
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
