# Project scope

**Manage Me** — a personal management dashboard. Single owner per account; all
data is scoped to the signed-in user.

## Features

- **Auth & accounts** — email/password (better-auth), `user` / `admin` roles.
  Every app page sits behind an auth-guarded layout.
- **Dashboard** — at-a-glance totals: receivable, payable, contact count, and
  recent transactions.
- **Hishab Nikash** (money / debt tracking) — contacts with running balances,
  transactions (lending, borrowing, payments), and a summary view. Amounts in
  BDT (৳).
- **Todos** — tasks with status, priority, and due dates; summary with
  completion / on-time rates plus overdue and due-soon lists.
- **Notes** — color-coded notes with tags, pinning, and archive.
- **Links** — bookmarks organized into folders, with tags and favicons.
- **Files** — nested folders and file storage (S3 / R2), uploads up to 100 MB.
- **Routines** — daily routines on a weekday schedule with start/end times.
  Today view has tap-to-complete check-off, a completion ring, and streaks;
  the All view groups by colored categories. Day boundary is Asia/Dhaka; the
  weekend is Friday–Saturday.
- **Admin** — user management: create users, set roles, reset passwords.

## Default working style: ponytail

Apply the **ponytail** approach by default on every coding task in this project —
the laziest solution that actually works: simplest, shortest, most minimal.

- Question whether the task needs to exist at all (YAGNI).
- Reach for the standard library before custom code.
- Prefer native platform/framework features before new dependencies.
- One line before fifty; no speculative abstractions or dead flexibility.

This is the standing default, so it does not need to be invoked per request. The
user can still dial intensity up (`ponytail ultra`) or step outside it for a
specific task by saying so.
