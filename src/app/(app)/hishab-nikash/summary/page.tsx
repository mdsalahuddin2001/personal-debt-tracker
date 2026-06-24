import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Scales,
} from "@/components/icons";
import { getDashboardSummary, getContactOptions } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";

export default async function SummaryPage() {
  const [summary, contacts] = await Promise.all([
    getDashboardSummary(),
    getContactOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Summary</h1>
          <p className="text-muted-foreground">
            Your lending and borrowing at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <ContactForm
            trigger={
              <Button variant="outline">
                <Plus className="size-4" /> Contact
              </Button>
            }
          />
          <TransactionForm
            contacts={contacts}
            trigger={
              <Button disabled={contacts.length === 0}>
                <Plus className="size-4" /> Transaction
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Receivable
            </CardTitle>
            <ArrowDownLeft className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(summary.totalReceivable)}
            </p>
            <CardDescription>Money owed to you</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payable
            </CardTitle>
            <ArrowUpRight className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(summary.totalPayable)}
            </p>
            <CardDescription>Money you owe</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Payable
            </CardTitle>
            <Scales className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-yellow-600">
              {formatCurrency(summary.totalPayable - summary.totalReceivable)}
            </p>
            <CardDescription>
              Net you owe after collecting all receivables
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacts
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.totalContacts}</p>
            <CardDescription>
              <Link href="/hishab-nikash/contacts" className="hover:underline">
                View all contacts
              </Link>
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest activity</CardDescription>
          </div>
          <Link
            href="/hishab-nikash/transactions"
            className="text-sm text-muted-foreground hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={summary.recentTransactions}
            showContact
            emptyMessage="No transactions yet. Add a contact, then record one."
          />
        </CardContent>
      </Card>
    </div>
  );
}
