import { cn } from "@/lib/utils";
import { formatSignedCurrency } from "@/lib/format";

/**
 * Renders a contact's net balance.
 * positive = receivable (green), negative = payable (red), ~0 = settled.
 */
export function BalanceBadge({
  balance,
  className,
}: {
  balance: number;
  className?: string;
}) {
  const settled = Math.abs(balance) < 0.005;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
        settled && "bg-muted text-muted-foreground",
        !settled &&
          balance > 0 &&
          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
        !settled &&
          balance < 0 &&
          "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        className
      )}
    >
      {settled ? "Settled" : formatSignedCurrency(balance)}
    </span>
  );
}

/** Short human description of a balance direction. */
export function balanceLabel(balance: number): string {
  if (Math.abs(balance) < 0.005) return "All settled up";
  return balance > 0 ? "Owes you" : "You owe";
}
