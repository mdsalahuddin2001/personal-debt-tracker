import { Plus } from "@/components/icons";
import { getTodayTodos } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/app/(app)/todos/_components/todo-form";
import { TodoCard } from "@/app/(app)/todos/_components/todo-card";

export default async function TodayPage() {
  const todos = await getTodayTodos();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Today</h1>
          <p className="text-muted-foreground">Due {formatDate(today)}</p>
        </div>
        <TodoForm
          defaultDueDate={today}
          trigger={
            <Button>
              <Plus className="size-4" /> Add task
            </Button>
          }
        />
      </div>

      {todos.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing due today. Enjoy the breathing room.
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
