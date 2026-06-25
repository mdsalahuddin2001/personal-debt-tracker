import Link from "next/link";
import { Plus, Archive } from "@/components/icons";
import { getNotesView } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { NoteForm } from "@/app/(app)/notes/_components/note-form";
import { NoteGrid } from "@/app/(app)/notes/_components/note-grid";
import { NoteFilters } from "@/app/(app)/notes/_components/note-filters";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const { notes, allTags, hasPinned } = await getNotesView({
    archived: false,
    search: q,
    tag,
  });

  const filtering = !!(q?.trim() || tag);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notes</h1>
          <p className="text-muted-foreground">Everything worth remembering</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/notes/archive">
              <Archive className="size-4" /> Archive
            </Link>
          </Button>
          <NoteForm
            trigger={
              <Button>
                <Plus className="size-4" /> New note
              </Button>
            }
          />
        </div>
      </div>

      <NoteFilters tags={allTags} />

      <NoteGrid
        notes={notes}
        hasPinned={hasPinned}
        emptyMessage={
          filtering
            ? "No notes match your search."
            : "No notes yet. Create your first one."
        }
      />
    </div>
  );
}
