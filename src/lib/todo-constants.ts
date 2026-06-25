import {
  type TodoStatus,
  type TodoPriority,
} from "@/lib/todo-types";

type StatusMeta = {
  /** Label shown on badges and in menus, e.g. "In progress". */
  label: string;
  /** Tailwind classes for the status badge. */
  badge: string;
};

export const STATUS_META: Record<TodoStatus, StatusMeta> = {
  todo: {
    label: "To-do",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  in_progress: {
    label: "In progress",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  done: {
    label: "Done",
    badge: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
};

type PriorityMeta = {
  label: string;
  badge: string;
  /** Sort weight, high first. */
  rank: number;
};

export const PRIORITY_META: Record<TodoPriority, PriorityMeta> = {
  high: {
    label: "High",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    rank: 3,
  },
  medium: {
    label: "Medium",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    rank: 2,
  },
  low: {
    label: "Low",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    rank: 1,
  },
};

export const STATUS_OPTIONS = (
  Object.keys(STATUS_META) as TodoStatus[]
).map((value) => ({ value, label: STATUS_META[value].label }));

export const PRIORITY_OPTIONS = (
  ["high", "medium", "low"] as TodoPriority[]
).map((value) => ({ value, label: PRIORITY_META[value].label }));

// Time-frame presets for the summary view. "custom" pairs with `from`/`to`
// query params; everything else is resolved relative to "now" on the server.
export const TODO_RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
] as const;

export type TodoRangeKey = (typeof TODO_RANGE_OPTIONS)[number]["value"];
