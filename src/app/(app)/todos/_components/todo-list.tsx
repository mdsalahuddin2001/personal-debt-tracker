import { PencilSimple, Trash, CalendarBlank, Flag } from "@/components/icons";
import type { SerializedTodo } from "@/lib/queries";
import { STATUS_META, PRIORITY_META } from "@/lib/todo-constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TodoForm } from "./todo-form";
import { DeleteTodoButton } from "./delete-todo-button";
import { TodoStatusSelect } from "./todo-status-select";

export function TodoList({
  todos,
  showActions = false,
  emptyMessage = "No tasks yet.",
}: {
  todos: SerializedTodo[];
  showActions?: boolean;
  emptyMessage?: string;
}) {
  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {todos.map((t) => {
        const done = t.status === "done";
        return (
          <li
            key={t.id}
            className="flex flex-wrap items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_META[t.status].badge
                  )}
                >
                  {STATUS_META[t.status].label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    PRIORITY_META[t.priority].badge
                  )}
                >
                  <Flag className="size-3" />
                  {PRIORITY_META[t.priority].label}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    done && "text-muted-foreground line-through"
                  )}
                >
                  {t.title}
                </span>
              </div>

              {t.description && (
                <p className="truncate text-sm text-muted-foreground">
                  {t.description}
                </p>
              )}

              {(t.dueDate || done) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {t.dueDate && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        t.overdue
                          ? "font-medium text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <CalendarBlank className="size-3" />
                      Due {formatDate(t.dueDate)}
                      {t.overdue && " · overdue"}
                    </span>
                  )}
                  {t.timing === "on_time" && (
                    <span className="text-green-600 dark:text-green-400">
                      Completed on time
                    </span>
                  )}
                  {t.timing === "late" && (
                    <span className="text-red-600 dark:text-red-400">
                      Completed late
                    </span>
                  )}
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex shrink-0 items-center gap-1">
                <TodoStatusSelect id={t.id} status={t.status} />
                <TodoForm
                  todo={t}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <PencilSimple className="size-4" />
                    </Button>
                  }
                />
                <DeleteTodoButton
                  id={t.id}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="size-4" />
                    </Button>
                  }
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
