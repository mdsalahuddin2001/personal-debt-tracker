import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction, type TransactionType } from "@/models/transaction";
import { Folder } from "@/models/folder";
import { FileItem } from "@/models/file";
import { Todo } from "@/models/todo";
import { type TodoStatus, type TodoPriority } from "@/lib/todo-types";
import { type DateRange } from "@/lib/todo-range";
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

// ----- Todos module -----

/** done tasks that had a due date are either "on_time" or "late"; null when
 * the timing isn't applicable (not done, or no due date). */
export type CompletionTiming = "on_time" | "late" | null;

export type SerializedTodo = {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  /** Not done and the due date is in the past. */
  overdue: boolean;
  /** For done tasks with a due date: whether they beat the deadline. */
  timing: CompletionTiming;
};

type LeanTodo = {
  _id: Types.ObjectId;
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
};

// Due dates are stored at UTC midnight (from a <input type="date">), but a task
// is "on time" / not "overdue" for the whole of its due day. Compare against the
// end of that day rather than its start.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function serializeTodo(t: LeanTodo, now: number): SerializedTodo {
  const due = t.dueDate ? new Date(t.dueDate) : null;
  const completed = t.completedAt ? new Date(t.completedAt) : null;
  const isDone = t.status === "done";
  const dueEnd = due ? due.getTime() + MS_PER_DAY - 1 : null;

  let timing: CompletionTiming = null;
  if (isDone && dueEnd !== null && completed) {
    timing = completed.getTime() <= dueEnd ? "on_time" : "late";
  }

  return {
    id: String(t._id),
    title: t.title,
    description: t.description ?? undefined,
    status: t.status,
    priority: t.priority,
    dueDate: due ? due.toISOString() : null,
    completedAt: completed ? completed.toISOString() : null,
    createdAt: new Date(t.createdAt).toISOString(),
    overdue: !isDone && dueEnd !== null && dueEnd < now,
    timing,
  };
}

export async function getAllTodos(): Promise<SerializedTodo[]> {
  const owner = await requireUserId();
  await connectDB();
  // Open tasks first, then by soonest due date, then newest. Done tasks sink
  // to the bottom (status order: done > in_progress > todo alphabetically, so
  // sort by a computed key instead — simplest is to fetch and sort in JS).
  const todos = await Todo.find({ owner }).lean<LeanTodo[]>();
  const now = Date.now();

  const statusRank: Record<TodoStatus, number> = {
    in_progress: 0,
    todo: 1,
    done: 2,
  };

  return todos
    .map((t) => serializeTodo(t, now))
    .sort((a, b) => {
      if (statusRank[a.status] !== statusRank[b.status])
        return statusRank[a.status] - statusRank[b.status];
      // Within the same status: tasks with a due date come first, soonest first.
      if (a.dueDate && b.dueDate)
        return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

export type TodoSummary = {
  total: number;
  byStatus: Record<TodoStatus, number>;
  /** done tasks that had a deadline and met it. */
  completedOnTime: number;
  /** done tasks that had a deadline and missed it. */
  completedLate: number;
  /** open tasks past their due date. */
  overdue: number;
  /** complet(ed/able) tasks relevant to the open list (see upcomingTasks). */
  dueSoon: number;
  /** done / total, 0–100, rounded. */
  completionRate: number;
  /** on-time / (done tasks that had a deadline), 0–100, rounded. */
  onTimeRate: number;
  overdueTasks: SerializedTodo[];
  /** When no window: open tasks due within 7 days. When a window is applied:
   * the window's open (not done, not overdue) tasks. */
  upcomingTasks: SerializedTodo[];
};

// A task belongs to a period by its due date, or its creation date when it has
// no due date — so undated tasks still surface in time-scoped views.
function referenceMs(raw: LeanTodo): number {
  return new Date(raw.dueDate ?? raw.createdAt).getTime();
}

export async function getTodoSummary(window: DateRange = null): Promise<TodoSummary> {
  const owner = await requireUserId();
  await connectDB();
  const all = await Todo.find({ owner }).lean<LeanTodo[]>();
  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;

  const todos = window
    ? all.filter((raw) => {
        const ms = referenceMs(raw);
        return ms >= window.start.getTime() && ms <= window.end.getTime();
      })
    : all;

  const byStatus: Record<TodoStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
  };
  let completedOnTime = 0;
  let completedLate = 0;
  let completedWithDeadline = 0;
  let overdue = 0;
  let dueSoon = 0;
  const overdueTasks: SerializedTodo[] = [];
  const upcomingTasks: SerializedTodo[] = [];

  for (const raw of todos) {
    const t = serializeTodo(raw, now);
    byStatus[t.status]++;

    if (t.timing === "on_time") {
      completedOnTime++;
      completedWithDeadline++;
    } else if (t.timing === "late") {
      completedLate++;
      completedWithDeadline++;
    }

    if (t.overdue) {
      overdue++;
      overdueTasks.push(t);
    } else if (t.status !== "done") {
      // With a window: every remaining open task in the period. Without one:
      // only tasks coming due within the next 7 days.
      if (window) {
        dueSoon++;
        upcomingTasks.push(t);
      } else if (t.dueDate && new Date(t.dueDate).getTime() <= weekAhead) {
        dueSoon++;
        upcomingTasks.push(t);
      }
    }
  }

  const total = todos.length;
  // Sort by due date ascending; undated tasks sink to the end.
  const byDueAsc = (a: SerializedTodo, b: SerializedTodo) => {
    if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  };
  overdueTasks.sort(byDueAsc);
  upcomingTasks.sort(byDueAsc);

  return {
    total,
    byStatus,
    completedOnTime,
    completedLate,
    overdue,
    dueSoon,
    completionRate: total ? Math.round((byStatus.done / total) * 100) : 0,
    onTimeRate: completedWithDeadline
      ? Math.round((completedOnTime / completedWithDeadline) * 100)
      : 0,
    overdueTasks,
    upcomingTasks,
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
