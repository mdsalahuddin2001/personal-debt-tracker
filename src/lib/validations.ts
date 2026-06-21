import { z } from "zod";
import { TRANSACTION_TYPES } from "@/lib/transaction-types";

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: optionalText(30),
  relationship: optionalText(50),
  notes: optionalText(500),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const transactionSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  type: z.enum(TRANSACTION_TYPES),
  // Kept as a string for the form layer; the server action converts to a
  // number. Avoids z.coerce's `unknown` input type fighting react-hook-form.
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0;
    }, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  note: optionalText(500),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
