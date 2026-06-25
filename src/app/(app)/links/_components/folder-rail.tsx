import Link from "next/link";
import { LinkSimple, FolderSimple, FolderPlus } from "@/components/icons";
import type { LinkFolderEntry } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CreateLinkFolderDialog } from "./create-link-folder-dialog";
import { FolderActions } from "./folder-actions";

/** Build a /links href for a rail entry, preserving the active search/tag. */
function hrefFor(folder: string | null, q?: string, tag?: string): string {
  const params = new URLSearchParams();
  if (folder) params.set("folder", folder);
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/links?${qs}` : "/links";
}

const rowBase =
  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors";
const rowActive = "bg-muted font-medium text-foreground";
const rowIdle = "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export function FolderRail({
  folders,
  selection,
  counts,
  q,
  tag,
}: {
  folders: LinkFolderEntry[];
  selection: string;
  counts: { all: number; uncategorized: number };
  q?: string;
  tag?: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      <Link
        href={hrefFor(null, q, tag)}
        className={cn(rowBase, selection === "all" ? rowActive : rowIdle)}
      >
        <LinkSimple className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">All links</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {counts.all}
        </span>
      </Link>

      <Link
        href={hrefFor("uncategorized", q, tag)}
        className={cn(
          rowBase,
          selection === "uncategorized" ? rowActive : rowIdle
        )}
      >
        <FolderSimple className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Uncategorized</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {counts.uncategorized}
        </span>
      </Link>

      {folders.length > 0 && (
        <div className="mt-2 mb-1 px-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Folders
        </div>
      )}

      {folders.map((f) => {
        const active = selection === f.id;
        return (
          <div
            key={f.id}
            className={cn(
              "group relative flex items-center rounded-md",
              active ? rowActive : "hover:bg-muted/60"
            )}
          >
            <Link
              href={hrefFor(f.id, q, tag)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              <FolderSimple className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground transition-opacity group-hover:opacity-0">
                {f.count}
              </span>
            </Link>
            <div className="absolute right-1">
              <FolderActions
                id={f.id}
                name={f.name}
                count={f.count}
                isActive={active}
              />
            </div>
          </div>
        );
      })}

      <CreateLinkFolderDialog
        trigger={
          <Button
            variant="ghost"
            className="mt-1 justify-start gap-2 px-2.5 text-muted-foreground"
          >
            <FolderPlus className="size-4" /> New folder
          </Button>
        }
      />
    </nav>
  );
}
