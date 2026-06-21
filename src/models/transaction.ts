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

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & {
  contact: Types.ObjectId;
};

export const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ||
  model<TransactionDoc>("Transaction", transactionSchema);
