import Link from "next/link";
import { PencilSimple, Trash } from "@/components/icons";
import type { TransactionType } from "@/lib/transaction-types";
import type { SerializedTransaction } from "@/lib/queries";
import { TYPE_META } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./transaction-form";
import { DeleteTransactionButton } from "./delete-transaction-button";

const TYPE_BADGE: Record<TransactionType, string> = {
  lend: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  receive: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  borrow: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  make_payment:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

export function TransactionList({
  transactions,
  contacts = [],
  showContact = false,
  showActions = false,
  emptyMessage = "No transactions yet.",
}: {
  transactions: SerializedTransaction[];
  contacts?: { id: string; name: string }[];
  showContact?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  TYPE_BADGE[t.type]
                )}
              >
                {TYPE_META[t.type].label}
              </span>
              {showContact && t.contactName && (
                <Link
                  href={`/hishab-nikash/contacts/${t.contactId}`}
                  className="text-sm font-medium hover:underline"
                >
                  {t.contactName}
                </Link>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(t.date)}
              </span>
            </div>
            {t.note && (
              <p className="truncate text-sm text-muted-foreground">{t.note}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <span className="font-semibold tabular-nums">
              {formatCurrency(t.amount)}
            </span>
            {showActions && (
              <>
                <TransactionForm
                  contacts={contacts}
                  transaction={t}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <PencilSimple className="size-4" />
                    </Button>
                  }
                />
                <DeleteTransactionButton
                  id={t.id}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="size-4" />
                    </Button>
                  }
                />
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
