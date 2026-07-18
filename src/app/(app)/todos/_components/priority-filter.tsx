"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PRIORITY_OPTIONS } from "@/lib/todo-constants";
import { cn } from "@/lib/utils";

const OPTIONS = [{ value: "all", label: "All priorities" }, ...PRIORITY_OPTIONS];

/** Segmented priority filter. Tasks are grouped by status on the page, so
 * priority is the only list-level filter kept. */
export function PriorityFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("priority") ?? "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("priority");
    else params.set("priority", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {OPTIONS.map((opt) => {
        const on = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            aria-pressed={on}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors",
              on
                ? "bg-card font-medium text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
