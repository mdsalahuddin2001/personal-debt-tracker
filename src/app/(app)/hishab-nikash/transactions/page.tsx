import { Plus } from "@/components/icons";
import { getAllTransactions, getContactOptions } from "@/lib/queries";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { TransactionFilters } from "@/components/transaction-filters";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; contact?: string }>;
}) {
  const { type, contact } = await searchParams;
  const [all, contacts] = await Promise.all([
    getAllTransactions(),
    getContactOptions(),
  ]);

  let transactions = all;
  if (type && type !== "all") {
    transactions = transactions.filter((t) => t.type === type);
  }
  if (contact && contact !== "all") {
    transactions = transactions.filter((t) => t.contactId === contact);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-muted-foreground">All recorded activity</p>
        </div>
        <TransactionForm
          contacts={contacts}
          trigger={
            <Button disabled={contacts.length === 0}>
              <Plus className="size-4" /> Add transaction
            </Button>
          }
        />
      </div>

      <TransactionFilters contacts={contacts} />

      <Card>
        <CardContent className="py-2">
          <TransactionList
            transactions={transactions}
            contacts={contacts}
            showContact
            showActions
            emptyMessage="No transactions match these filters."
          />
        </CardContent>
      </Card>
    </div>
  );
}
