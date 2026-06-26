import type { RoutineCategoryOption, SerializedRoutine } from "@/lib/queries";
import { TodayCard } from "./today-card";

/** Today's routines, listed in time order. */
export function TodayBoard({
  routines,
  categories,
}: {
  routines: SerializedRoutine[];
  categories: RoutineCategoryOption[];
}) {
  return (
    <div className="space-y-2">
      {routines.map((routine) => (
        <TodayCard
          key={routine.id}
          routine={routine}
          categories={categories}
        />
      ))}
    </div>
  );
}
