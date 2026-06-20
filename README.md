# Expense Tracker

Fullstack admin app built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn/ui**, **MongoDB**, and **Better Auth**.

For now there is a single user type — `admin`. There is **no public signup**; admins are provisioned with a seed script and can only log in.

## Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Framework      | Next.js 16 (App Router, TS)     |
| Styling        | Tailwind CSS v4 + shadcn/ui     |
| Database       | MongoDB (`mongodb` driver)      |
| Authentication | Better Auth (`admin` plugin)    |

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

| Variable              | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `MONGODB_URI`         | MongoDB connection string                            |
| `MONGODB_DB_NAME`     | Database name (default `expense_tracker`)            |
| `BETTER_AUTH_SECRET`  | Random secret — generate: `openssl rand -base64 32`  |
| `BETTER_AUTH_URL`     | App base URL (e.g. `http://localhost:3000`)          |
| `SEED_ADMIN_EMAIL`    | Email for the seeded admin                           |
| `SEED_ADMIN_PASSWORD` | Password for the seeded admin                        |
| `SEED_ADMIN_NAME`     | Display name for the seeded admin                    |

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
│   ├── api/auth/[...all]/route.ts   # Better Auth route handler
│   ├── login/                       # Login page + client form
│   ├── dashboard/                   # Protected dashboard + sign-out
│   ├── layout.tsx                   # Root layout + Toaster
│   └── page.tsx                     # Redirects to /dashboard
├── lib/
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth React client
│   └── db.ts                        # MongoDB client + db
├── components/ui/                   # shadcn/ui components
└── proxy.ts                         # Route protection for /dashboard
scripts/
└── seed.ts                          # Admin seeding script
```

## Notes

- Public signup is disabled via `emailAndPassword.disableSignUp` in `src/lib/auth.ts`.
- `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`) does an optimistic
  cookie check; full session validation happens in server components via
  `auth.api.getSession`.
