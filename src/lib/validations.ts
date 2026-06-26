import { z } from "zod";
import { TRANSACTION_TYPES } from "@/lib/transaction-types";
import { TODO_STATUSES, TODO_PRIORITIES } from "@/lib/todo-types";
import { NOTE_COLORS } from "@/lib/note-types";
import { isValidUrl } from "@/lib/link-types";
import {
  ROUTINE_COLORS,
  ROUTINE_TIME_REGEX,
  MAX_ROUTINE_TITLE,
  MAX_ROUTINE_DESCRIPTION,
} from "@/lib/routine-types";

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

// ----- Todos module -----

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: optionalText(2000),
  status: z.enum(TODO_STATUSES),
  priority: z.enum(TODO_PRIORITIES),
  // Empty string = no due date. Kept as a string for the form layer; the
  // server action converts it to a Date (or null).
  dueDate: z.string().optional().or(z.literal("")),
});

export type TodoInput = z.infer<typeof todoSchema>;

// ----- Notes module -----

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: optionalText(10000),
  // Rich-text body as HTML from the editor. Images are stored as file URLs,
  // not inline data, so this stays small in practice.
  content: optionalText(200000),
  color: z.enum(NOTE_COLORS),
  // Comma-separated in the form; the server action splits, trims, lowercases,
  // and dedupes into the stored string[]. Kept as a string here so the input
  // binds cleanly to react-hook-form.
  tags: optionalText(400),
});

export type NoteInput = z.infer<typeof noteSchema>;

// ----- Links module -----

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  // Accepted with or without a protocol; the action prepends https:// before
  // storing. Validated here so a bad URL surfaces inline in the form.
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2000)
    .refine(isValidUrl, "Enter a valid URL"),
  description: optionalText(2000),
  // Comma-separated in the form; the action splits, trims, lowercases, and
  // dedupes into the stored string[]. Kept as a string for react-hook-form.
  tags: optionalText(400),
  // "" / "none" = uncategorized. An ObjectId string otherwise (checked server-side).
  folderId: z.string().optional().or(z.literal("")),
});

export type LinkInput = z.infer<typeof linkSchema>;

export const linkFolderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

export type LinkFolderInput = z.infer<typeof linkFolderSchema>;

// ----- Routines module -----

export const routineSchema = z.object({
  title: z.string().min(1, "Title is required").max(MAX_ROUTINE_TITLE),
  description: optionalText(MAX_ROUTINE_DESCRIPTION),
  // "HH:MM" 24-hour, straight from <input type="time">.
  timeOfDay: z
    .string()
    .regex(ROUTINE_TIME_REGEX, "Choose a time of day"),
  // Weekdays (0 = Sunday … 6 = Saturday); at least one must be picked.
  days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Pick at least one day")
    .max(7),
  // Optional "HH:MM" end time from <input type="time">. The action turns the
  // start→end span into the stored durationMinutes (wrapping past midnight).
  // "" = no end time / not tracked.
  endTime: z
    .string()
    .regex(ROUTINE_TIME_REGEX, "Choose a valid time")
    .optional()
    .or(z.literal("")),
  // "" / "none" = uncategorized. An ObjectId string otherwise (checked server-side).
  categoryId: z.string().optional().or(z.literal("")),
});

export type RoutineInput = z.infer<typeof routineSchema>;

export const routineCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  color: z.enum(ROUTINE_COLORS),
});

export type RoutineCategoryInput = z.infer<typeof routineCategorySchema>;

// ----- Files module -----

/** Max size for a single uploaded file (100 MB). */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Names that map to a single filesystem-like entry: no slashes, not just dots.
const entryName = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(max, `Must be ${max} characters or fewer`)
    .refine((v) => !v.includes("/") && !v.includes("\\"), "Name can't contain slashes")
    .refine((v) => v !== "." && v !== "..", "Invalid name");

export const folderNameSchema = z.object({
  name: entryName(120),
});

export type FolderNameInput = z.infer<typeof folderNameSchema>;

export const fileNameSchema = z.object({
  name: entryName(200),
});

export type FileNameInput = z.infer<typeof fileNameSchema>;

export const uploadRequestSchema = z.object({
  name: entryName(200),
  size: z
    .number()
    .int()
    .positive("File is empty")
    .max(MAX_FILE_SIZE, "File is larger than 100 MB"),
  contentType: z.string().min(1).max(255),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(USER_ROLES),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "At least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
