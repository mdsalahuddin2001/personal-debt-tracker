import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction, type TransactionType } from "@/models/transaction";
import { Folder } from "@/models/folder";
import { FileItem } from "@/models/file";
import { TYPE_META } from "@/lib/constants";
import { requireUserId } from "@/lib/auth-helpers";

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

async function getBalanceMap(owner: string): Promise<Map<string, number>> {
  const balances = await Transaction.aggregate<{
    _id: Types.ObjectId;
    balance: number;
  }>([
    { $match: { owner } },
    { $group: { _id: "$contact", balance: { $sum: signedAmount } } },
  ]);
  return new Map(balances.map((b) => [String(b._id), b.balance]));
}

export async function getContactsWithBalances(): Promise<ContactWithBalance[]> {
  const owner = await requireUserId();
  await connectDB();
  const [contacts, balanceMap] = await Promise.all([
    Contact.find({ owner }).sort({ name: 1 }).lean<LeanContact[]>(),
    getBalanceMap(owner),
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
  const owner = await requireUserId();
  await connectDB();
  const contacts = await Contact.find({ owner })
    .sort({ name: 1 })
    .lean<LeanContact[]>();
  return contacts.map((c) => ({ id: String(c._id), name: c.name }));
}

export async function getContactDetail(id: string): Promise<{
  contact: ContactWithBalance;
  transactions: SerializedTransaction[];
} | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  const owner = await requireUserId();
  await connectDB();

  const contact = await Contact.findOne({ _id: id, owner }).lean<LeanContact>();
  if (!contact) return null;

  const txns = await Transaction.find({ contact: id, owner })
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
  const owner = await requireUserId();
  await connectDB();
  const txns = await Transaction.find({ owner })
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
  const owner = await requireUserId();
  await connectDB();
  const [balanceMap, totalContacts, recent] = await Promise.all([
    getBalanceMap(owner),
    Contact.countDocuments({ owner }),
    Transaction.find({ owner })
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

// ----- Files module -----

type LeanFolder = {
  _id: Types.ObjectId;
  name: string;
  parent: Types.ObjectId | null;
  createdAt: Date;
};

type LeanFile = {
  _id: Types.ObjectId;
  name: string;
  folder: Types.ObjectId | null;
  size: number;
  contentType: string;
  createdAt: Date;
};

export type FolderEntry = { id: string; name: string; createdAt: string };
export type FileEntry = {
  id: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
};
export type Breadcrumb = { id: string; name: string };

export type FolderContents = {
  /** null when viewing the root ("My Files"). */
  currentFolder: { id: string; name: string } | null;
  /** Ancestor chain from the topmost folder down to and including the current. */
  breadcrumbs: Breadcrumb[];
  folders: FolderEntry[];
  files: FileEntry[];
};

/**
 * List the folders and files directly inside `folderId` (or the root when
 * null), together with the breadcrumb trail. Returns null when the folder id
 * is malformed or not owned by the user, so the page can render notFound().
 */
export async function getFolderContents(
  folderId: string | null
): Promise<FolderContents | null> {
  const owner = await requireUserId();
  await connectDB();

  let currentFolder: FolderContents["currentFolder"] = null;
  const breadcrumbs: Breadcrumb[] = [];

  if (folderId) {
    if (!Types.ObjectId.isValid(folderId)) return null;
    const folder = await Folder.findOne({ _id: folderId, owner }).lean<LeanFolder | null>();
    if (!folder) return null;
    currentFolder = { id: String(folder._id), name: folder.name };

    // Walk up the parent chain to build the breadcrumb trail (guard cycles).
    const seen = new Set<string>([String(folder._id)]);
    let parent = folder.parent;
    breadcrumbs.unshift({ id: String(folder._id), name: folder.name });
    while (parent) {
      const pid = String(parent);
      if (seen.has(pid)) break;
      seen.add(pid);
      const p = await Folder.findOne({ _id: parent, owner }).lean<LeanFolder | null>();
      if (!p) break;
      breadcrumbs.unshift({ id: String(p._id), name: p.name });
      parent = p.parent;
    }
  }

  const parentFilter = folderId ?? null;
  const [folders, files] = await Promise.all([
    Folder.find({ owner, parent: parentFilter }).sort({ name: 1 }).lean<LeanFolder[]>(),
    FileItem.find({ owner, folder: parentFilter }).sort({ name: 1 }).lean<LeanFile[]>(),
  ]);

  return {
    currentFolder,
    breadcrumbs,
    folders: folders.map((f) => ({
      id: String(f._id),
      name: f.name,
      createdAt: new Date(f.createdAt).toISOString(),
    })),
    files: files.map((f) => ({
      id: String(f._id),
      name: f.name,
      size: f.size,
      contentType: f.contentType,
      createdAt: new Date(f.createdAt).toISOString(),
    })),
  };
}

export type FolderOption = { id: string; name: string; parentId: string | null };

/** Every folder the user owns — used to pick a destination when moving. */
export async function getFolderOptions(): Promise<FolderOption[]> {
  const owner = await requireUserId();
  await connectDB();
  const folders = await Folder.find({ owner }).sort({ name: 1 }).lean<LeanFolder[]>();
  return folders.map((f) => ({
    id: String(f._id),
    name: f.name,
    parentId: f.parent ? String(f.parent) : null,
  }));
}
