import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { TRANSACTION_TYPES, type TransactionType } from "@/lib/transaction-types";

// Transaction types, from the user's perspective:
// - lend:         user gives money to contact      (+receivable)
// - receive:      contact pays the user back        (-receivable)
// - borrow:       user takes money from contact     (-payable / user owes)
// - make_payment: user pays the contact back        (+ reduces what user owes)
export { TRANSACTION_TYPES, type TransactionType };

const transactionSchema = new Schema(
  {
    // better-auth user id (24-hex string) that owns this transaction.
    owner: { type: String, required: true, index: true },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Owner-scoped lookups: recent-first lists and per-contact queries.
transactionSchema.index({ owner: 1, date: -1 });
transactionSchema.index({ owner: 1, contact: 1 });

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & {
  contact: Types.ObjectId;
};

export const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ||
  model<TransactionDoc>("Transaction", transactionSchema);
