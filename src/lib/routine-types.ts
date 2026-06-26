// Shared literals and pure date/time helpers for the routine module. Kept free
// of any server-only or React import so the Mongoose models, the Zod
// validations, the server actions, and the client components can all share it.

// Category colors. "slate" is the neutral default; the rest pair a saturated
// swatch with a soft card tint that reads in both light and dark themes.
export const ROUTINE_COLORS = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
] as const;
export type RoutineColor = (typeof ROUTINE_COLORS)[number];

// Hard caps mirrored by the Zod schema and the model so the form, the action,
// and the schema all agree on the same limits.
export const MAX_ROUTINE_TITLE = 120;
export const MAX_ROUTINE_DESCRIPTION = 1000;
/** Longest a single routine can be (24h, in minutes). */
export const MAX_ROUTINE_DURATION = 24 * 60;

/** "HH:MM" in 24-hour time, e.g. 07:00 or 21:30. */
export const ROUTINE_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Weekday labels indexed by JS day number (0 = Sunday … 6 = Saturday).
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAY_LABELS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// Bangladesh work week: Sunday–Thursday are working days; the weekend is
// Friday and Saturday.
export const WEEKDAYS = [0, 1, 2, 3, 4];
export const WEEKEND = [5, 6];

/** Compact human summary of the days a routine runs on. */
export function summarizeDays(days: number[]): string {
  const set = new Set(days);
  if (set.size === 7) return "Every day";
  if (set.size === 5 && WEEKDAYS.every((d) => set.has(d))) return "Working days";
  if (set.size === 2 && WEEKEND.every((d) => set.has(d))) return "Weekend";
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join(", ");
}

/** Render "HH:MM" (24h) as a friendly 12-hour clock, e.g. 7:00 AM. */
export function formatTimeOfDay(timeOfDay: string): string {
  const [h, m] = timeOfDay.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Add minutes to a "HH:MM" time, wrapping past midnight, e.g. 07:00 +45 → 07:45. */
export function addMinutesToTime(timeOfDay: string, minutes: number): string {
  const [h, m] = timeOfDay.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Minutes from a "HH:MM" start to a "HH:MM" end. An end at or before the start
 * is read as crossing midnight; an equal start/end (zero span) returns null.
 */
export function rangeDurationMinutes(start: string, end: string): number | null {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff === 0) return null;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

/**
 * The routine's time as a range when it has a duration ("7:00 AM – 7:45 AM"),
 * or just the start time when it doesn't.
 */
export function formatTimeRange(
  timeOfDay: string,
  durationMinutes: number | null
): string {
  const start = formatTimeOfDay(timeOfDay);
  if (durationMinutes == null) return start;
  const end = formatTimeOfDay(addMinutesToTime(timeOfDay, durationMinutes));
  return `${start} – ${end}`;
}

/** Friendly duration, e.g. "45 min" or "1h 30m". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ----- Date keys & streaks -----
//
// Completions are stored as a calendar-date key ("YYYY-MM-DD"). "Today" is
// resolved in the app's timezone so the day rolls over at local midnight rather
// than UTC midnight; every other key operation treats the string as a pure
// calendar date anchored at UTC, which keeps weekday and day-shift arithmetic
// stable regardless of where the server runs.

/** The timezone the daily boundary is measured in. */
export const APP_TIME_ZONE = "Asia/Dhaka";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's "YYYY-MM-DD" key in the app timezone. */
export function todayKey(now: Date = new Date()): string {
  return dayKeyFormatter.format(now);
}

/** JS weekday (0 = Sunday) for a "YYYY-MM-DD" key. */
export function weekdayOfKey(key: string): number {
  return new Date(`${key}T00:00:00Z`).getUTCDay();
}

/** Shift a date key by whole days (negative goes back in time). */
export function shiftKey(key: string, deltaDays: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function prevKey(key: string): string {
  return shiftKey(key, -1);
}

/**
 * Count consecutive completed occurrences ending at today. A routine only runs
 * on its scheduled weekdays, so missed *unscheduled* days never break a streak.
 * Today counts when completed but, when not yet done, doesn't break the streak —
 * the day isn't over — so counting resumes from the previous scheduled day.
 */
export function computeStreak(
  days: number[],
  completed: Set<string>,
  today: string
): number {
  if (days.length === 0) return 0;
  const scheduled = (key: string) => days.includes(weekdayOfKey(key));

  let key = today;
  if (scheduled(key) && !completed.has(key)) key = prevKey(key);

  let streak = 0;
  for (let guard = 0; guard < 366; guard++) {
    if (scheduled(key)) {
      if (completed.has(key)) streak++;
      else break;
    }
    key = prevKey(key);
  }
  return streak;
}
