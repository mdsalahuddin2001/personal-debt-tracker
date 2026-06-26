import { cn } from "@/lib/utils";

/** Circular completion gauge for the Today header. */
export function ProgressRing({
  done,
  total,
  size = 116,
  stroke = 10,
}: {
  done: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const complete = total > 0 && done === total;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${done} of ${total} routines done`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-500",
            complete
              ? "stroke-green-500"
              : "stroke-primary"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{pct}%</span>
        <span className="text-xs text-muted-foreground">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}
