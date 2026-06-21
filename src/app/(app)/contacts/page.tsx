import Link from "next/link";
import { Plus, Phone, ChevronRight } from "lucide-react";
import { getContactsWithBalances } from "@/lib/queries";
import { BalanceBadge, balanceLabel } from "@/components/balance-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";

export default async function ContactsPage() {
  const contacts = await getContactsWithBalances();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-muted-foreground">
            {contacts.length} {contacts.length === 1 ? "person" : "people"}
          </p>
        </div>
        <ContactForm
          trigger={
            <Button>
              <Plus className="size-4" /> Add contact
            </Button>
          }
        />
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No contacts yet. Add your first one to start tracking.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {contacts.map((c) => (
              <Link
                key={c.id}
                href={`/contacts/${c.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{c.name}</p>
                    {c.relationship && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {c.relationship}
                      </span>
                    )}
                  </div>
                  {c.phone && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="size-3" /> {c.phone}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <BalanceBadge balance={c.balance} />
                    <p className="text-xs text-muted-foreground">
                      {balanceLabel(c.balance)}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
