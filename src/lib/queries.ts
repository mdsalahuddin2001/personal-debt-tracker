import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction, type TransactionType } from "@/models/transaction";
import { TYPE_META } from "@/lib/constants";

export type ContactWithBalance = {
  id: string;
  name: string;
  phone?: string;
  relationship?: string;
  notes?: string;
  /** net > 0 = receivable (they owe you); net < 0 = payable (you owe them). */
  balance: number;
};

export type SerializedTransaction = {
  id: string;
  contactId: string;
  contactName?: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// Aggregation expression: amount, signed by transaction type.
const signedAmount = {
  $multiply: [
    "$amount",
    { $cond: [{ $in: ["$type", ["lend", "make_payment"]] }, 1, -1] },
  ],
};

type LeanContact = {
  _id: Types.ObjectId;
  name: string;
  phone?: string | null;
  relationship?: string | null;
  notes?: string | null;
};

type LeanTransaction = {
  _id: Types.ObjectId;
  contact: Types.ObjectId | { _id: Types.ObjectId; name: string };
  type: TransactionType;
  amount: number;
  date: Date;
  note?: string | null;
};

function isPopulatedContact(
  c: LeanTransaction["contact"]
): c is { _id: Types.ObjectId; name: string } {
  return typeof c === "object" && c !== null && "name" in c;
}

function serializeTxn(t: LeanTransaction): SerializedTransaction {
  const contact = t.contact;
  const populated = isPopulatedContact(contact);
  return {
    id: String(t._id),
    contactId: String(populated ? contact._id : contact),
    contactName: populated ? contact.name : undefined,
    type: t.type,
    amount: t.amount,
    date: new Date(t.date).toISOString(),
    note: t.note ?? undefined,
  };
}

async function getBalanceMap(): Promise<Map<string, number>> {
  const balances = await Transaction.aggregate<{
    _id: Types.ObjectId;
    balance: number;
  }>([{ $group: { _id: "$contact", balance: { $sum: signedAmount } } }]);
  return new Map(balances.map((b) => [String(b._id), b.balance]));
}

export async function getContactsWithBalances(): Promise<ContactWithBalance[]> {
  await connectDB();
  const [contacts, balanceMap] = await Promise.all([
    Contact.find().sort({ name: 1 }).lean<LeanContact[]>(),
    getBalanceMap(),
  ]);

  return contacts.map((c) => ({
    id: String(c._id),
    name: c.name,
    phone: c.phone ?? undefined,
    relationship: c.relationship ?? undefined,
    notes: c.notes ?? undefined,
    balance: round2(balanceMap.get(String(c._id)) ?? 0),
  }));
}

/** Minimal {id, name} list for selects and filters. */
export async function getContactOptions(): Promise<
  { id: string; name: string }[]
> {
  await connectDB();
  const contacts = await Contact.find().sort({ name: 1 }).lean<LeanContact[]>();
  return contacts.map((c) => ({ id: String(c._id), name: c.name }));
}

export async function getContactDetail(id: string): Promise<{
  contact: ContactWithBalance;
  transactions: SerializedTransaction[];
} | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();

  const contact = await Contact.findById(id).lean<LeanContact>();
  if (!contact) return null;

  const txns = await Transaction.find({ contact: id })
    .sort({ date: -1, createdAt: -1 })
    .lean<LeanTransaction[]>();

  const balance = txns.reduce(
    (sum, t) => sum + t.amount * TYPE_META[t.type].sign,
    0
  );

  return {
    contact: {
      id: String(contact._id),
      name: contact.name,
      phone: contact.phone ?? undefined,
      relationship: contact.relationship ?? undefined,
      notes: contact.notes ?? undefined,
      balance: round2(balance),
    },
    transactions: txns.map(serializeTxn),
  };
}

export async function getAllTransactions(): Promise<SerializedTransaction[]> {
  await connectDB();
  const txns = await Transaction.find()
    .sort({ date: -1, createdAt: -1 })
    .populate("contact", "name")
    .lean<LeanTransaction[]>();
  return txns.map(serializeTxn);
}

export type DashboardSummary = {
  totalReceivable: number;
  totalPayable: number;
  totalContacts: number;
  recentTransactions: SerializedTransaction[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await connectDB();
  const [balanceMap, totalContacts, recent] = await Promise.all([
    getBalanceMap(),
    Contact.countDocuments(),
    Transaction.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .populate("contact", "name")
      .lean<LeanTransaction[]>(),
  ]);

  let totalReceivable = 0;
  let totalPayable = 0;
  for (const balance of balanceMap.values()) {
    if (balance > 0) totalReceivable += balance;
    else if (balance < 0) totalPayable += -balance;
  }

  return {
    totalReceivable: round2(totalReceivable),
    totalPayable: round2(totalPayable),
    totalContacts,
    recentTransactions: recent.map(serializeTxn),
  };
}
