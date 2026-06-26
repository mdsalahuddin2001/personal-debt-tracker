@AGENTS.md
@project-scope.md

# Project memory

**Manage Me** personal dashboard. Next.js 16 (app router, Turbopack) + React 19
+ TypeScript, MongoDB / Mongoose, better-auth, Tailwind v4 + shadcn/radix,
react-hook-form + Zod, sonner, Phosphor icons. File storage on S3 / R2.

## Where things live

- Pages: `src/app/(app)/<module>/` (+ a local `_components/`), all auth-guarded
  by `(app)/layout.tsx`.
- Models: `src/models/`. Server actions: `src/lib/actions/`. Read queries:
  `src/lib/queries.ts`. Zod schemas: `src/lib/validations.ts`.
- Shared per-module literals/helpers: `src/lib/<module>-types.ts`; UI metadata
  (labels, colors): `src/lib/<module>-constants.ts`.
- Icons: re-exported from `src/components/icons.tsx` (Phosphor) — add new ones
  there, don't import the package directly.

## Conventions

- Every server action starts with `requireUserId()` / `requireSession()`
  (`src/lib/auth-helpers.ts`); all queries and writes are owner-scoped.
- Actions validate input with Zod, return `ActionResult` (`{ success }` |
  `{ error }`), and call `revalidatePath()` after writes; the client toasts the
  result.
- Forms are react-hook-form + `zodResolver` inside a dialog. Lists and cards are
  server components fed by serialized query types (`Serialized*`).
- Mongoose models guard against HMR recompilation and define `owner`-scoped
  indexes.
