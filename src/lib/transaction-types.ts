// Mongoose-free transaction type literals so they can be safely imported by
// both client components (forms) and server code (models, queries).
export const TRANSACTION_TYPES = [
  "lend",
  "receive",
  "borrow",
  "make_payment",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
