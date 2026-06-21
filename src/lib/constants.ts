import type { TransactionType } from "@/lib/transaction-types";

type TypeMeta = {
  /** Past-tense label for timelines, e.g. "Lent". */
  label: string;
  /** Action verb for menus/forms, e.g. "Lend". */
  verb: string;
  /** +1 increases receivable / reduces debt, -1 the opposite. */
  sign: 1 | -1;
};

export const TYPE_META: Record<TransactionType, TypeMeta> = {
  lend: { label: "Lent", verb: "Lend", sign: 1 },
  receive: { label: "Received", verb: "Receive Payment", sign: -1 },
  borrow: { label: "Borrowed", verb: "Borrow", sign: -1 },
  make_payment: { label: "Paid", verb: "Make Payment", sign: 1 },
};

export const TRANSACTION_TYPE_OPTIONS = (
  Object.keys(TYPE_META) as TransactionType[]
).map((value) => ({ value, label: TYPE_META[value].verb }));
