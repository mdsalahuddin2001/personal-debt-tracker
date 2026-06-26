"use client";

import { useState } from "react";
import { PushPin, Tag } from "@/components/icons";
import type { SerializedNote } from "@/lib/queries";
import { COLOR_META, NOTE_PROSE } from "@/lib/note-constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Read-only view of the full note. Uncontrolled by default — renders the note
 * title as the trigger. Pass `open`/`onOpenChange` to drive it from elsewhere
 * (e.g. the card's View button), which hides the title trigger.
 */
export function NoteView({
  note,
  open: openProp,
  onOpenChange,
}: {
  note: SerializedNote;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  const setOpen = (next: boolean) => {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      {!controlled && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left font-medium break-words hover:underline"
        >
          {note.pinned && (
            <PushPin
              weight="fill"
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Pinned"
            />
          )}
          <span className="min-w-0 truncate">{note.title}</span>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              {note.pinned && (
                <PushPin weight="fill" className="size-4 text-muted-foreground" />
              )}
              {note.title}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <Field label="Description">
              {note.description ? (
                <p className="text-sm whitespace-pre-wrap">{note.description}</p>
              ) : (
                <Empty />
              )}
            </Field>

            <Field label="Content">
              {note.content ? (
                <div
                  className={NOTE_PROSE}
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              ) : (
                <Empty />
              )}
            </Field>

            <Field label="Tags">
              {note.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 font-normal"
                    >
                      <Tag className="size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Color">
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "size-3 rounded-full",
                      COLOR_META[note.color].swatch
                    )}
                  />
                  {COLOR_META[note.color].label}
                </span>
              </Field>
              <Field label="Created">
                <span className="text-sm">{formatDate(note.createdAt)}</span>
              </Field>
              <Field label="Updated">
                <span className="text-sm">{formatDate(note.updatedAt)}</span>
              </Field>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground/60">—</p>;
}
