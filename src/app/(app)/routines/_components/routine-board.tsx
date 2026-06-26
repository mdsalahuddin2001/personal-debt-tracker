import type { RoutineCategoryOption, SerializedRoutine } from "@/lib/queries";
import { RoutineCard } from "./routine-card";

/** All routines, listed in time order. */
export function RoutineBoard({
  routines,
  categories,
  emptyMessage = "No routines yet. Add your first one.",
}: {
  routines: SerializedRoutine[];
  categories: RoutineCategoryOption[];
  emptyMessage?: string;
}) {
  if (routines.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          categories={categories}
        />
      ))}
    </div>
  );
}
