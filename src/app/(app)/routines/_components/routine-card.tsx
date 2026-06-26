import { Clock, Fire, CalendarBlank, Check } from "@/components/icons";
import type { RoutineCategoryOption, SerializedRoutine } from "@/lib/queries";
import { COLOR_META, UNCATEGORIZED_BAR } from "@/lib/routine-constants";
import { formatTimeRange, summarizeDays } from "@/lib/routine-types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RoutineActions } from "./routine-actions";

export function RoutineCard({
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
        "flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm",
        bar
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-medium break-words">{routine.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          {routine.streak > 0 && (
            <Badge
              variant="secondary"
              className="gap-0.5 font-normal text-amber-600 dark:text-amber-400"
            >
              <Fire weight="fill" className="size-3" />
              {routine.streak}
            </Badge>
          )}
          <RoutineActions routine={routine} categories={categories} />
        </div>
      </div>

      {routine.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {routine.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatTimeRange(routine.timeOfDay, routine.durationMinutes)}
        </span>
        <span className="flex items-center gap-1">
          <CalendarBlank className="size-3.5" />
          {summarizeDays(routine.days)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {routine.categoryName ? (
          <Badge
            variant="secondary"
            className={cn(
              "font-normal",
              routine.categoryColor && COLOR_META[routine.categoryColor].chip
            )}
          >
            {routine.categoryName}
          </Badge>
        ) : (
          <span />
        )}
        {routine.doneToday && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Check weight="bold" className="size-3.5" /> Done today
          </span>
        )}
      </div>
    </article>
  );
}
