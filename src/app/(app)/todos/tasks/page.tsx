import { Plus } from "@/components/icons";
import { getAllTodos } from "@/lib/queries";
import { TODO_STATUSES, TODO_PRIORITIES } from "@/lib/todo-types";
import type { TodoStatus, TodoPriority } from "@/lib/todo-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/app/(app)/todos/_components/todo-form";
import { TodoList } from "@/app/(app)/todos/_components/todo-list";
import { TodoFilters } from "@/app/(app)/todos/_components/todo-filters";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { status, priority } = await searchParams;
  let todos = await getAllTodos();

  if (status && TODO_STATUSES.includes(status as TodoStatus)) {
    todos = todos.filter((t) => t.status === status);
  }
  if (priority && TODO_PRIORITIES.includes(priority as TodoPriority)) {
    todos = todos.filter((t) => t.priority === priority);
  }

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

      <TodoFilters />

      <Card>
        <CardContent className="py-2">
          <TodoList
            todos={todos}
            showActions
            emptyMessage="No tasks match these filters."
          />
        </CardContent>
      </Card>
    </div>
  );
}
