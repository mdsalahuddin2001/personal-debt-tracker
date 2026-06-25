import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { getNotesView } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { NoteGrid } from "@/app/(app)/notes/_components/note-grid";
import { NoteFilters } from "@/app/(app)/notes/_components/note-filters";

export default async function ArchivedNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const { notes, allTags } = await getNotesView({
    archived: true,
    search: q,
    tag,
  });

  const filtering = !!(q?.trim() || tag);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Archived notes</h1>
          <p className="text-muted-foreground">
            Tucked away — restore any note to bring it back.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/notes">
            <ArrowLeft className="size-4" /> Back to notes
          </Link>
        </Button>
      </div>

      <NoteFilters tags={allTags} />

      <NoteGrid
        notes={notes}
        emptyMessage={
          filtering
            ? "No archived notes match your search."
            : "Nothing archived."
        }
      />
    </div>
  );
}
