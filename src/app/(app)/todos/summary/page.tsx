import Link from "next/link";
import {
  Plus,
  ListChecks,
  CheckCircle,
  Warning,
  Clock,
} from "@/components/icons";
import { getTodoSummary } from "@/lib/queries";
import { STATUS_META } from "@/lib/todo-constants";
import { resolveTodoRange, formatRangeLabel } from "@/lib/todo-range";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TodoForm } from "@/app/(app)/todos/_components/todo-form";
import { TodoList } from "@/app/(app)/todos/_components/todo-list";
import { SummaryRangeFilter } from "@/app/(app)/todos/_components/summary-range-filter";

export default async function TodoSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range, from, to } = await searchParams;
  const window = resolveTodoRange(range, from, to);
  const scoped = window !== null;
  const rangeLabel = formatRangeLabel(range, window);

  const summary = await getTodoSummary(window);
  const completedTotal = summary.completedOnTime + summary.completedLate;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Summary</h1>
          <p className="text-muted-foreground">
            {scoped
              ? `How tasks for ${rangeLabel.toLowerCase()} are tracking.`
              : "How your tasks are tracking against their deadlines."}
          </p>
        </div>
        <TodoForm
          trigger={
            <Button>
              <Plus className="size-4" /> Add task
            </Button>
          }
        />
      </div>

      <SummaryRangeFilter />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <ListChecks className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.total}</p>
            <CardDescription>
              {summary.byStatus.todo} {STATUS_META.todo.label.toLowerCase()} ·{" "}
              {summary.byStatus.in_progress} in progress
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <CheckCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {summary.completionRate}%
            </p>
            <CardDescription>
              {summary.byStatus.done} of {summary.total} done
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <Warning className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              {summary.overdue}
            </p>
            <CardDescription>Open and past their due date</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-time Rate
            </CardTitle>
            <Clock className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              {completedTotal ? `${summary.onTimeRate}%` : "—"}
            </p>
            <CardDescription>
              {completedTotal
                ? `${summary.completedOnTime} on time · ${summary.completedLate} late`
                : "No tasks completed against a deadline yet"}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-red-600">Overdue</CardTitle>
              <CardDescription>Needs attention now</CardDescription>
            </div>
            <Link
              href="/todos/tasks?status=todo"
              className="text-sm text-muted-foreground hover:underline"
            >
              View tasks
            </Link>
          </CardHeader>
          <CardContent>
            <TodoList
              todos={summary.overdueTasks}
              emptyMessage="Nothing overdue. Nice work!"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{scoped ? "Open Tasks" : "Due Soon"}</CardTitle>
              <CardDescription>
                {scoped
                  ? `Still open for ${rangeLabel.toLowerCase()}`
                  : "Open tasks due within 7 days"}
              </CardDescription>
            </div>
            <Link
              href="/todos/tasks"
              className="text-sm text-muted-foreground hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <TodoList
              todos={summary.upcomingTasks}
              emptyMessage={
                scoped
                  ? "No open tasks in this period."
                  : "Nothing due in the next week."
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
