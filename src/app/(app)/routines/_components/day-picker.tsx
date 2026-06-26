"use client";

import { DAY_OPTIONS, DAY_PRESETS } from "@/lib/routine-constants";
import { cn } from "@/lib/utils";

/** Weekday multi-select with quick presets, used inside the routine form. */
export function DayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  const selected = new Set(value);

  function toggle(day: number) {
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange([...next].sort((a, b) => a - b));
  }

  const matchesPreset = (days: readonly number[]) =>
    days.length === selected.size && days.every((d) => selected.has(d));

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {DAY_OPTIONS.map((day) => {
          const active = selected.has(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggle(day.value)}
              aria-pressed={active}
              className={cn(
                "h-9 w-11 rounded-md border text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DAY_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange([...preset.days].sort((a, b) => a - b))}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
              matchesPreset(preset.days)
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
