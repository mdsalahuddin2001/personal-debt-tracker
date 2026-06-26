import { Clock, Fire } from "@/components/icons";
import type { RoutineCategoryOption, SerializedRoutine } from "@/lib/queries";
import { COLOR_META, UNCATEGORIZED_BAR } from "@/lib/routine-constants";
import { formatTimeRange } from "@/lib/routine-types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RoutineToggle } from "./routine-toggle";
import { RoutineActions } from "./routine-actions";

export function TodayCard({
  routine,
  categories,
}: {
  routine: SerializedRoutine;
  categories: RoutineCategoryOption[];
}) {
  const bar = routine.categoryColor
    ? COLOR_META[routine.categoryColor].bar
    : UNCATEGORIZED_BAR;

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-lg border border-l-4 bg-card p-3 shadow-xs transition-shadow hover:shadow-sm",
        bar,
        routine.doneToday && "bg-muted/40"
      )}
    >
      <RoutineToggle
        id={routine.id}
        done={routine.doneToday}
        title={routine.title}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "min-w-0 truncate font-medium",
              routine.doneToday && "text-muted-foreground line-through"
            )}
          >
            {routine.title}
          </h3>
          {routine.streak > 0 && (
            <Badge
              variant="secondary"
              className="gap-0.5 font-normal text-amber-600 dark:text-amber-400"
            >
              <Fire weight="fill" className="size-3" />
              {routine.streak}
            </Badge>
          )}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatTimeRange(routine.timeOfDay, routine.durationMinutes)}
          </span>
          {routine.categoryName && (
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2 rounded-full",
                  routine.categoryColor
                    ? COLOR_META[routine.categoryColor].swatch
                    : "bg-muted-foreground/40"
                )}
              />
              {routine.categoryName}
            </span>
          )}
        </div>
      </div>

      <RoutineActions routine={routine} categories={categories} />
    </article>
  );
}
