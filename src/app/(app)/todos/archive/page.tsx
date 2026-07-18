import { getArchivedTodos } from "@/lib/queries";
import { TodoCard } from "@/app/(app)/todos/_components/todo-card";

export default async function ArchivePage() {
  const todos = await getArchivedTodos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Archive</h1>
        <p className="text-muted-foreground">
          Tasks you&apos;ve put away. Restore any to bring it back.
        </p>
      </div>

      {todos.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing archived yet.
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
