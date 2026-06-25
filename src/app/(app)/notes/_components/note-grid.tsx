import { PushPin } from "@/components/icons";
import type { SerializedNote } from "@/lib/queries";
import { NoteCard } from "./note-card";

function Grid({ notes }: { notes: SerializedNote[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

export function NoteGrid({
  notes,
  hasPinned = false,
  emptyMessage = "No notes yet.",
}: {
  notes: SerializedNote[];
  /** When true, split pinned notes into their own labelled section. */
  hasPinned?: boolean;
  emptyMessage?: string;
}) {
  if (notes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (!hasPinned) {
    return <Grid notes={notes} />;
  }

  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <PushPin weight="fill" className="size-3.5" /> Pinned
        </h2>
        <Grid notes={pinned} />
      </section>

      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Others
          </h2>
          <Grid notes={others} />
        </section>
      )}
    </div>
  );
}
