import { Plus } from "@/components/icons";
import { getTodos } from "@/lib/queries";
import { TODO_PRIORITIES, type TodoPriority } from "@/lib/todo-types";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/app/(app)/todos/_components/todo-form";
import { TodoCard } from "@/app/(app)/todos/_components/todo-card";
import { PriorityFilter } from "@/app/(app)/todos/_components/priority-filter";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ priority?: string }>;
}) {
  const { priority } = await searchParams;
  const priorityFilter =
    priority && TODO_PRIORITIES.includes(priority as TodoPriority)
      ? (priority as TodoPriority)
      : undefined;

  const todos = await getTodos({ priority: priorityFilter });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Everything on your plate</p>
        </div>
        <TodoForm
          trigger={
            <Button>
              <Plus className="size-4" /> Add task
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PriorityFilter />
        <p className="text-sm text-muted-foreground">
          {todos.length} {todos.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {priorityFilter
              ? "No tasks match this priority."
              : "No tasks here yet. Add your first one."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {todos.map((t) => (
            <TodoCard key={t.id} todo={t} showActions showStatusBadge />
          ))}
        </div>
      )}
    </div>
  );
}
