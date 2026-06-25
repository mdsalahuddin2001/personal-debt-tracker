import { notFound } from "next/navigation";
import { Plus } from "@/components/icons";
import { getLinksView } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { LinkForm } from "./_components/link-form";
import { LinkGrid } from "./_components/link-grid";
import { LinkFilters } from "./_components/link-filters";
import { FolderRail } from "./_components/folder-rail";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string; tag?: string }>;
}) {
  const { folder, q, tag } = await searchParams;
  const view = await getLinksView({ folder, search: q, tag });
  if (!view) notFound();

  const {
    folders,
    folderOptions,
    links,
    allTags,
    selection,
    currentFolderName,
    counts,
  } = view;

  const filtering = !!(q?.trim() || tag);
  const activeFolderId =
    selection !== "all" && selection !== "uncategorized" ? selection : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {currentFolderName ?? "Links"}
          </h1>
          <p className="text-muted-foreground">
            Important links, kept in order
          </p>
        </div>
        <LinkForm
          folders={folderOptions}
          defaultFolderId={activeFolderId}
          trigger={
            <Button>
              <Plus className="size-4" /> New link
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <aside className="md:border-r md:pr-4">
          <FolderRail
            folders={folders}
            selection={selection}
            counts={counts}
            q={q}
            tag={tag}
          />
        </aside>

        <div className="min-w-0 space-y-4">
          <LinkFilters tags={allTags} />
          <LinkGrid
            links={links}
            folders={folderOptions}
            emptyMessage={
              filtering
                ? "No links match your search."
                : "No links here yet. Add your first one."
            }
          />
        </div>
      </div>
    </div>
  );
}
