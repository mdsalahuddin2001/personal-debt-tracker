import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, CalendarCheck } from "@/components/icons";
import { getRoutinesBoard } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { RoutineForm } from "../_components/routine-form";
import { RoutineBoard } from "../_components/routine-board";
import { CategoryRail } from "../_components/category-rail";

export default async function AllRoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const board = await getRoutinesBoard({ category });
  if (!board) notFound();

  const {
    categories,
    categoryOptions,
    routines,
    selection,
    currentCategoryName,
    counts,
  } = board;

  const activeCategoryId =
    selection !== "all" && selection !== "uncategorized" ? selection : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {currentCategoryName ?? "All routines"}
          </h1>
          <p className="text-muted-foreground">
            Every routine, organized by time of day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/routines">
              <CalendarCheck className="size-4" /> Today
            </Link>
          </Button>
          <RoutineForm
            categories={categoryOptions}
            defaultCategoryId={activeCategoryId}
            trigger={
              <Button>
                <Plus className="size-4" /> New routine
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <aside className="md:border-r md:pr-4">
          <CategoryRail
            categories={categories}
            selection={selection}
            counts={counts}
          />
        </aside>

        <div className="min-w-0">
          <RoutineBoard
            routines={routines}
            categories={categoryOptions}
            emptyMessage={
              selection === "all"
                ? "No routines yet. Add your first one."
                : "No routines in this category yet."
            }
          />
        </div>
      </div>
    </div>
  );
}
