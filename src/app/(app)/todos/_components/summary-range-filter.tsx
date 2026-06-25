"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TODO_RANGE_OPTIONS } from "@/lib/todo-constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SummaryRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = searchParams.get("range") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function selectRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("range");
      params.delete("from");
      params.delete("to");
    } else {
      params.set("range", value);
      if (value !== "custom") {
        params.delete("from");
        params.delete("to");
      }
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function setCustomBound(key: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">
        {TODO_RANGE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant={active === opt.value ? "default" : "ghost"}
            className={cn("h-7 px-3", active !== opt.value && "text-muted-foreground")}
            onClick={() => selectRange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {active === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            aria-label="From date"
            value={from}
            max={to || undefined}
            onChange={(e) => setCustomBound("from", e.target.value)}
            className="h-8 w-auto"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            aria-label="To date"
            value={to}
            min={from || undefined}
            onChange={(e) => setCustomBound("to", e.target.value)}
            className="h-8 w-auto"
          />
        </div>
      )}
    </div>
  );
}
