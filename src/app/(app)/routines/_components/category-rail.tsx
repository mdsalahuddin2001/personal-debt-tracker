import Link from "next/link";
import { Repeat, FolderSimple, Plus } from "@/components/icons";
import type { RoutineCategoryEntry } from "@/lib/queries";
import { COLOR_META } from "@/lib/routine-constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import { CategoryActions } from "./category-actions";

function hrefFor(category: string | null): string {
  return category ? `/routines/all?category=${category}` : "/routines/all";
}

const rowBase =
  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors";
const rowActive = "bg-muted font-medium text-foreground";
const rowIdle = "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export function CategoryRail({
  categories,
  selection,
  counts,
}: {
  categories: RoutineCategoryEntry[];
  selection: string;
  counts: { all: number; uncategorized: number };
}) {
  return (
    <nav className="flex flex-col gap-1">
      <Link
        href={hrefFor(null)}
        className={cn(rowBase, selection === "all" ? rowActive : rowIdle)}
      >
        <Repeat className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">All routines</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {counts.all}
        </span>
      </Link>

      <Link
        href={hrefFor("uncategorized")}
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

      {categories.length > 0 && (
        <div className="mt-2 mb-1 px-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Categories
        </div>
      )}

      {categories.map((c) => {
        const active = selection === c.id;
        return (
          <div
            key={c.id}
            className={cn(
              "group relative flex items-center rounded-md",
              active ? rowActive : "hover:bg-muted/60"
            )}
          >
            <Link
              href={hrefFor(c.id)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "size-3 shrink-0 rounded-full",
                  COLOR_META[c.color].swatch
                )}
              />
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground transition-opacity group-hover:opacity-0">
                {c.count}
              </span>
            </Link>
            <div className="absolute right-1">
              <CategoryActions category={c} isActive={active} />
            </div>
          </div>
        );
      })}

      <CategoryForm
        trigger={
          <Button
            variant="ghost"
            className="mt-1 justify-start gap-2 px-2.5 text-muted-foreground"
          >
            <Plus className="size-4" /> New category
          </Button>
        }
      />
    </nav>
  );
}
