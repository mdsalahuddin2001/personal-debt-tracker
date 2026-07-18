import type { SerializedTodo } from "@/lib/queries";
import { TodoCard } from "./todo-card";

/** A flat, ungrouped stack of task cards. Used on the summary view. */
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
    <div className="grid gap-2.5">
      {todos.map((t) => (
        <TodoCard
          key={t.id}
          todo={t}
          showActions={showActions}
          showStatusBadge
        />
      ))}
    </div>
  );
}
