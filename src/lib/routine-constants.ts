import { type RoutineColor, ROUTINE_COLORS } from "@/lib/routine-types";

type ColorMeta = {
  /** Label shown in the color picker. */
  label: string;
  /** Small round swatch / category dot. */
  swatch: string;
  /** Left accent bar applied to a routine card. */
  bar: string;
  /** Soft pill style for the category chip. */
  chip: string;
};

// "slate" stays neutral so an untouched category reads quietly; the rest pair a
// saturated swatch with a soft chip that works in both themes.
export const COLOR_META: Record<RoutineColor, ColorMeta> = {
  slate: {
    label: "Slate",
    swatch: "bg-slate-400",
    bar: "border-l-slate-300 dark:border-l-slate-600",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  red: {
    label: "Red",
    swatch: "bg-red-500",
    bar: "border-l-red-500",
    chip: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  orange: {
    label: "Orange",
    swatch: "bg-orange-500",
    bar: "border-l-orange-500",
    chip: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  amber: {
    label: "Amber",
    swatch: "bg-amber-500",
    bar: "border-l-amber-500",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  green: {
    label: "Green",
    swatch: "bg-green-500",
    bar: "border-l-green-500",
    chip: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  teal: {
    label: "Teal",
    swatch: "bg-teal-500",
    bar: "border-l-teal-500",
    chip: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  blue: {
    label: "Blue",
    swatch: "bg-blue-500",
    bar: "border-l-blue-500",
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  purple: {
    label: "Purple",
    swatch: "bg-purple-500",
    bar: "border-l-purple-500",
    chip: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  pink: {
    label: "Pink",
    swatch: "bg-pink-500",
    bar: "border-l-pink-500",
    chip: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
};

export const COLOR_OPTIONS = ROUTINE_COLORS.map((value) => ({
  value,
  label: COLOR_META[value].label,
}));

/** Card styling for a routine with no category — neutral, no tint. */
export const UNCATEGORIZED_BAR = "border-l-border";

// Day toggles for the routine form, in local week order (Sunday starts the
// Bangladesh work week).
export const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

// One-tap presets in the day picker. Working days are Sun–Thu; the weekend is
// Fri–Sat.
export const DAY_PRESETS = [
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Working days", days: [0, 1, 2, 3, 4] },
  { label: "Weekend", days: [5, 6] },
] as const;
