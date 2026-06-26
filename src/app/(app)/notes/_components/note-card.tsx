import { Tag } from "@/components/icons";
import type { SerializedNote } from "@/lib/queries";
import { COLOR_META } from "@/lib/note-constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NoteActions } from "./note-actions";
import { NoteView } from "./note-view";

export function NoteCard({ note }: { note: SerializedNote }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm",
        COLOR_META[note.color].card
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <NoteView note={note} />
        <NoteActions note={note} />
      </div>

      {note.description && (
        <p className="line-clamp-2 text-sm whitespace-pre-wrap text-muted-foreground">
          {note.description}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 font-normal">
              <Tag className="size-3" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <p className="mt-auto text-xs text-muted-foreground">
        Updated {formatDate(note.updatedAt)}
      </p>
    </article>
  );
}
