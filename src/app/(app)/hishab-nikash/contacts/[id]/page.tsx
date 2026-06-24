import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  PencilSimple,
  Trash,
  Phone,
} from "@/components/icons";
import { getContactDetail } from "@/lib/queries";
import { BalanceBadge, balanceLabel } from "@/components/balance-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { DeleteContactButton } from "@/components/delete-contact-button";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContactDetail(id);
  if (!data) notFound();

  const { contact, transactions } = data;
  const contactOption = [{ id: contact.id, name: contact.name }];

  return (
    <div className="space-y-6">
      <Link
        href="/hishab-nikash/contacts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="size-4" /> Contacts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{contact.name}</h1>
            {contact.relationship && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {contact.relationship}
              </span>
            )}
          </div>
          {contact.phone && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="size-3" /> {contact.phone}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <ContactForm
            contact={contact}
            trigger={
              <Button variant="outline" size="sm">
                <PencilSimple className="size-4" /> Edit
              </Button>
            }
          />
          <DeleteContactButton
            id={contact.id}
            name={contact.name}
            trigger={
              <Button variant="outline" size="sm">
                <Trash className="size-4" /> Delete
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-sm text-muted-foreground">Current balance</p>
            <div className="mt-1 flex items-center gap-2">
              <BalanceBadge balance={contact.balance} className="text-base" />
              <span className="text-sm text-muted-foreground">
                {balanceLabel(contact.balance)}
              </span>
            </div>
          </div>
          <TransactionForm
            contacts={contactOption}
            fixedContactId={contact.id}
            trigger={
              <Button>
                <Plus className="size-4" /> Add transaction
              </Button>
            }
          />
        </CardContent>
      </Card>

      {contact.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">
            {contact.notes}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            contacts={contactOption}
            showActions
            emptyMessage="No transactions with this contact yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
