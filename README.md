# Personal Debt & Loan Tracker

A single-user personal finance app to track money you **lend** to others and **borrow** from others — across multiple installments — with automatic per-contact balances.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn/ui**, **MongoDB**, and **Better Auth**. Single user type — `admin`. There is **no public signup**; the admin is provisioned with a seed script and can only log in.

## Features

- **Contacts** — create, edit, delete people you transact with.
- **Transactions** — four types: Lend, Borrow, Receive Payment, Make Payment.
- **Automatic balances** — per contact: `lend − receive − borrow + make_payment`.
  Positive = receivable (they owe you), negative = payable (you owe them).
- **Dashboard** — Total Receivable, Total Payable, contact count, recent activity.
- **Contact detail** — info, current balance, and full transaction timeline.
- **Transactions page** — global history with type/contact filters.

Amounts are shown in **BDT (৳)**.

## Stack

| Concern        | Choice                                          |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router, TS)                     |
| Styling        | Tailwind CSS v4 + shadcn/ui                     |
| Auth DB        | MongoDB via native `mongodb` driver             |
| Domain data    | MongoDB via **Mongoose** (Contact, Transaction) |
| Mutations      | Next.js Server Actions                          |
| Authentication | Better Auth (`admin` plugin)                    |

> Better Auth uses the native `mongodb` client (`src/lib/db.ts`); domain models use
> Mongoose (`src/lib/mongoose.ts`). Both connect to the same database.

## Getting started

### 1. Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+
- A running MongoDB instance (local `mongodb://localhost:27017` or Atlas)

Install dependencies:

```bash
pnpm install
```

### 2. Configure environment

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable              | Description                                         |
| --------------------- | --------------------------------------------------- |
| `MONGODB_URI`         | MongoDB connection string                           |
| `MONGODB_DB_NAME`     | Database name (default `debt-tracker`)              |
| `BETTER_AUTH_SECRET`  | Random secret — generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL`     | App base URL (e.g. `http://localhost:3000`)         |
| `SEED_ADMIN_EMAIL`    | Email for the seeded admin                          |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin                       |
| `SEED_ADMIN_NAME`     | Display name for the seeded admin                   |

### 3. Seed the admin user

```bash
pnpm seed
```

This creates an admin user from the `SEED_ADMIN_*` variables. It is idempotent —
re-running it resets the existing admin's password.

### 4. Run the app

```bash
pnpm dev
```

Open <http://localhost:3000> — you'll be redirected to `/login`. Sign in with the
seeded admin credentials to reach `/dashboard`.

## Project structure

```
src/
├── app/
│   ├── (app)/                       # Authenticated route group (shared nav shell)
│   │   ├── layout.tsx               # App shell: nav + sign-out (auth-guarded)
│   │   ├── dashboard/page.tsx       # Summary cards + recent transactions
│   │   ├── contacts/page.tsx        # Contact list with balances
│   │   ├── contacts/[id]/page.tsx   # Contact detail + transaction timeline
│   │   └── transactions/page.tsx    # Global history + filters
│   ├── api/auth/[...all]/route.ts   # Better Auth route handler
│   ├── login/                       # Login page + client form
│   ├── layout.tsx                   # Root layout + Toaster
│   └── page.tsx                     # Redirects to /dashboard
├── lib/
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth React client
│   ├── auth-helpers.ts              # requireSession()
│   ├── db.ts                        # Native MongoDB client (auth)
│   ├── mongoose.ts                  # Cached Mongoose connection (domain)
│   ├── queries.ts                   # Read/aggregation helpers + balances
│   ├── validations.ts               # Shared zod schemas
│   ├── format.ts                    # BDT currency + date formatting
│   ├── constants.ts                 # Transaction type metadata
│   ├── transaction-types.ts         # Mongoose-free type literals (client-safe)
│   └── actions/                     # Server actions (contacts, transactions)
├── models/                          # Mongoose models (contact, transaction)
├── components/                      # Forms, dialogs, lists, nav, badges
│   └── ui/                          # shadcn/ui components
└── proxy.ts                         # Route protection
scripts/
└── seed.ts                          # Admin seeding script
```

## Notes

- Public signup is disabled via `emailAndPassword.disableSignUp` in `src/lib/auth.ts`.
- `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`) does an optimistic
  cookie check for `/dashboard`, `/contacts`, `/transactions`; full session
  validation happens in the `(app)` layout and server actions via `requireSession()`.
- The balance convention lives in one place — `signedAmount` in `src/lib/queries.ts`
  and `TYPE_META` in `src/lib/constants.ts`.
