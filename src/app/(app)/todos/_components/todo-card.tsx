import { CalendarBlank } from "@/components/icons";
import type { SerializedTodo } from "@/lib/queries";
import { STATUS_META, PRIORITY_META } from "@/lib/todo-constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TodoCompleteToggle } from "./todo-complete-toggle";
import { TodoRowActions } from "./todo-row-actions";

/**
 * A single-line task row. The essentials sit on the line (title, priority, due
 * date); the full detail lives behind the row — clicking it opens the edit
 * dialog, which doubles as the details view. `showActions` gates the
 * interactive affordances (used on the tasks page, off on the read-only summary).
 */
export function TodoCard({
  todo: t,
  showActions = false,
  /** Show the status pill inline (used where rows aren't grouped by status). */
  showStatusBadge = false,
}: {
  todo: SerializedTodo;
  showActions?: boolean;
  showStatusBadge?: boolean;
}) {
  const done = t.status === "done";

  const title = (
    <span
      className={cn(
        "min-w-0 truncate font-medium",
        done && "text-muted-foreground line-through"
      )}
    >
      {t.title}
    </span>
  );

  const meta = (
    <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
      <span
        className={cn(
          "hidden items-center rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
          PRIORITY_META[t.priority].badge
        )}
      >
        {PRIORITY_META[t.priority].label}
      </span>
      {showStatusBadge && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            STATUS_META[t.status].badge
          )}
        >
          {STATUS_META[t.status].label}
        </span>
      )}
      {t.dueDate && (
        <span
          className={cn(
            "flex items-center gap-1 text-xs whitespace-nowrap",
            t.overdue
              ? "font-medium text-red-600 dark:text-red-400"
              : "text-muted-foreground"
          )}
        >
          <CalendarBlank className="size-3.5" />
          {formatDate(t.dueDate)}
        </span>
      )}
    </span>
  );

  return (
    <article
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-l-4 bg-card px-3 py-2.5 shadow-xs transition-shadow hover:shadow-sm",
        PRIORITY_META[t.priority].bar,
        done && "opacity-70"
      )}
    >
      {showActions ? (
        <TodoCompleteToggle id={t.id} status={t.status} title={t.title} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            done ? "bg-green-500" : "bg-muted-foreground/30"
          )}
        />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {title}
        {meta}
      </div>

      {showActions && <TodoRowActions todo={t} />}
    </article>
  );
}
