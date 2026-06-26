import Link from "next/link";
import { Plus, CalendarCheck, ListChecks } from "@/components/icons";
import { getRoutinesToday, getRoutineCategoryOptions } from "@/lib/queries";
import { APP_TIME_ZONE } from "@/lib/routine-types";
import { Button } from "@/components/ui/button";
import { RoutineForm } from "./_components/routine-form";
import { TodayBoard } from "./_components/today-board";
import { ProgressRing } from "./_components/progress-ring";

const longDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

function encouragement(done: number, total: number): string {
  if (total === 0) return "Nothing scheduled for today.";
  if (done === total) return "Every routine done — beautiful work!";
  if (done === 0) return "A fresh start. Check them off as you go.";
  const left = total - done;
  return `${left} to go. Keep the momentum.`;
}

export default async function RoutinesTodayPage() {
  const [{ routines, done, total, dateKey }, categories] = await Promise.all([
    getRoutinesToday(),
    getRoutineCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Today</h1>
          <p className="text-muted-foreground">
            {longDate.format(new Date(`${dateKey}T00:00:00Z`))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/routines/all">
              <ListChecks className="size-4" /> All routines
            </Link>
          </Button>
          <RoutineForm
            categories={categories}
            trigger={
              <Button>
                <Plus className="size-4" /> New routine
              </Button>
            }
          />
        </div>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-5 rounded-xl border bg-card p-5 shadow-xs">
          <ProgressRing done={done} total={total} />
          <div className="min-w-0">
            <p className="text-lg font-medium">{encouragement(done, total)}</p>
            <p className="text-sm text-muted-foreground">
              {done} of {total} routine{total === 1 ? "" : "s"} completed today
            </p>
          </div>
        </div>
      )}

      {total === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <CalendarCheck className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No routines scheduled for today.
          </p>
          <p className="text-sm text-muted-foreground">
            Add one, or check{" "}
            <Link href="/routines/all" className="underline">
              all routines
            </Link>
            .
          </p>
        </div>
      ) : (
        <TodayBoard routines={routines} categories={categories} />
      )}
    </div>
  );
}
