import { formatDate } from "@/lib/format";

/** A resolved time window, or null for "all time". */
export type DateRange = { start: Date; end: Date } | null;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Due dates are stored at UTC midnight (from <input type="date">), so we resolve
// period boundaries in UTC too — keeps "today"/"this week" aligned with how the
// dates were saved, regardless of server timezone.
function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}

function endOfUTCDay(d: Date): Date {
  return new Date(startOfUTCDay(d).getTime() + MS_PER_DAY - 1);
}

/**
 * Turn a `range` preset (plus optional `from`/`to` for "custom") into a concrete
 * window. Returns null for "all" / unknown values, or a custom range with no
 * bounds. `now` is injectable for testing.
 */
export function resolveTodoRange(
  range?: string,
  from?: string,
  to?: string,
  now: Date = new Date()
): DateRange {
  switch (range) {
    case "today":
      return { start: startOfUTCDay(now), end: endOfUTCDay(now) };

    case "week": {
      // ISO week: Monday → Sunday, containing `now`.
      const day = now.getUTCDay(); // 0 = Sun … 6 = Sat
      const sinceMonday = (day + 6) % 7;
      const monday = new Date(startOfUTCDay(now).getTime() - sinceMonday * MS_PER_DAY);
      const sunday = new Date(monday.getTime() + 6 * MS_PER_DAY);
      return { start: monday, end: endOfUTCDay(sunday) };
    }

    case "month": {
      const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
      );
      // Day 0 of the next month is the last day of this one.
      const lastDay = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 0, 0, 0, 0)
      );
      return { start, end: endOfUTCDay(lastDay) };
    }

    case "custom": {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      const validFrom = fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : null;
      const validTo = toDate && !Number.isNaN(toDate.getTime()) ? toDate : null;
      if (!validFrom && !validTo) return null;

      const start = validFrom ? startOfUTCDay(validFrom) : new Date(0);
      const end = validTo ? endOfUTCDay(validTo) : endOfUTCDay(now);
      // Guard against an inverted range.
      if (start.getTime() > end.getTime()) return { start: end, end: start };
      return { start, end };
    }

    default:
      return null; // "all" or anything unrecognized
  }
}

/** Human label for the active window, e.g. "This week" or a date span. */
export function formatRangeLabel(range: string | undefined, window: DateRange): string {
  if (!window) return "All time";
  switch (range) {
    case "today":
      return "Today";
    case "week":
      return "This week";
    case "month":
      return "This month";
    default:
      return `${formatDate(window.start)} – ${formatDate(window.end)}`;
  }
}
