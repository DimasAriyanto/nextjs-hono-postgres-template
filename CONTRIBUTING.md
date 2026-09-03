# 👩‍💻 Contributing Guide

Thank you for contributing to this project!
This document contains technical guidelines to keep the code and folder structure consistent.

---

## 📂 Project Structure

```bash
project-root/
├── src/
│   ├── app/               # Next.js App Router — routes only (route groups, page.tsx, layout.tsx, api/[[...route]])
│   ├── components/        # Global reusable components (ui/, data-table/, ...)
│   ├── features/          # Modularization per feature/menu (see below)
│   ├── layouts/           # Shared layout shells (admin-layout-components, app-layout-components)
│   ├── contexts/          # React context providers
│   ├── providers/         # App-level providers (query client, theme, etc.)
│   ├── hooks/              # Global reusable hooks
│   ├── libs/               # Helper functions, configs, clients (e.g. hono-client.ts)
│   ├── constants/          # Global constants
│   ├── contracts/          # Shared cross-layer contracts/types
│   ├── i18n/                # next-intl config and request config
│   ├── types/               # Global type definitions (*.d.ts)
│   └── server/              # Backend layer — see "Backend (Hono) Structure" below
│       ├── http/            # routes/, controllers/, middlewares/, validators/, response.ts
│       ├── services/        # Business logic
│       ├── repositories/    # Drizzle queries
│       ├── databases/       # schemas/, migrations/, seed.ts, client.ts
│       ├── errors/          # AppError hierarchy + global error handler
│       └── utils/           # hash, token, storage drivers, email templates
├── public/                 # Static assets (public/uploads for local storage driver)
├── messages/                # next-intl translation JSON files
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

> Note: `src/proxy.ts` (project root of `src/`) is Next.js 16's request-interception file — the successor to the old `middleware.ts`. See `AGENTS.md` before touching it; this repo's Next.js version differs from what most training data assumes.

---

### ✅ Flat Structure (small feature, ≤ 3 files)

Example: `features/about`

```bash
features/
└── about/
    ├── about-wrapper.tsx   # main page component
    ├── hooks.ts            # optional
    └── index.ts
```

Use **flat structure** for:

-   Static pages (About, Contact).
-   Only 1–2 main components needed.
-   No complex logic.

---

### ✅ Nested Structure (large feature, > 3 files)

Example: `features/gallery`

```bash
features/
└── gallery/
    ├── components/
    │   ├── gallery-list-wrapper.tsx
    │   └── index.ts
    ├── apis/
    │   └── gallery.api.ts   # the ONLY place in this feature allowed to call the backend
    ├── hooks/
    │   └── use-gallery.ts
    └── index.ts
```

Use **nested structure** for:

-   Complex pages (Home, Dashboard, Article).
-   Many section components.
-   API logic, hooks, or specific types involved.
-   High maintainability required.

Feature-local types are usually declared inline in the `apis/`/`hooks/` file that uses them (prefixed `T…`, e.g. `TGalleryItem`). Only promote a type to a dedicated file/folder once it's shared by more than one file in the feature. Types shared across the whole app go in `src/types/*.d.ts`.

---

## 🔒 Frontend must not import `@/server` directly

Frontend code (`src/app`, `src/components`, `src/features/*/components`, `src/features/*/hooks`) must **never** import from `@/server` directly — not even from a Server Component like `layout.tsx`. Always go through that feature's `apis/*.api.ts`, which calls the HTTP API (`@/libs/hono-client`).

The only files allowed to import `@/server` directly are infrastructure, not app code:

-   `src/proxy.ts`
-   `src/app/api/[[...route]]/route.ts` (the Hono catch-all handler)
-   `src/libs/hono-client.ts`
-   `src/i18n/request.ts` (runs on every request as Next.js server infra, not app-level FE code)

This keeps the frontend decoupled from the database/service layer and matches how the app is actually deployable (API layer could be split out later without touching feature code).

---

## 🖥️ Backend (Hono) Structure

All backend code lives under `src/server`, exposed through a single Next.js Route Handler at `src/app/api/[[...route]]/route.ts`, which mounts the Hono app from `src/server/http`.

Request flow for a typical endpoint:

```
routes/*.routes.ts  →  validators/*.validator.ts  →  middlewares/*  →  controllers/*.controller.ts  →  services/*.service.ts  →  repositories/*.repository.ts  →  databases/schemas
```

-   **routes/** — wires a Hono sub-app: path + HTTP method + middleware chain (`auth`, `checkPermission`, `rateLimit`, `turnstileVerify`) + validator + controller.
-   **validators/** — Zod schemas via `@hono/zod-validator`, one file per resource.
-   **controllers/** — thin: parse request, call the service, return via `src/server/http/response.ts` (`response.ok/created/paginated/success`).
-   **services/** — business logic. This is where auth rules, permission resolution, token issuance, etc. live.
-   **repositories/** — the only layer allowed to write Drizzle queries against `databases/schemas`.
-   **errors/** — throw `AppError` subclasses (`AuthError`, `ValidationError`, `NotFoundError`, `ConflictError`, ...) from services/controllers; `error-handler.ts` converts them to the standard error response shape below. Don't `try/catch` and swallow these in controllers.

New backend resource checklist: add a schema in `databases/schemas`, a repository, a service, a validator, a controller, a routes file, then mount it in `src/server/http/routes/index.ts`.

---

## 📌 Naming Convention

-   **Folder & file**: `kebab-case` (example: `section-hero.tsx`).
-   **React Component**: file in `kebab-case`, component itself in `PascalCase`.
-   **Hooks**: `kebab-case` file, `use-` prefix (example: `use-gallery.ts`).
-   **Types**: prefix `T` (example: `TGalleryItem`); global shared types live in `src/types/*.d.ts`.
-   **API client files**: end with `.api.ts` (example: `gallery.api.ts`).
-   **Backend files**: end with `.controller.ts`, `.service.ts`, `.repository.ts`, `.routes.ts`, `.validator.ts`, `.schema.ts` matching their layer.

---

## ⚙️ Code Style

-   Use **TypeScript**.
-   Follow automatic linting & formatting with **ESLint + Prettier**.
-   Use **absolute import alias** (`@/components`, `@/features`, `@/server`, etc).
-   All PRs must pass lint (`npm run lint`) and build (`npm run build`) — this is enforced by CI (`.github/workflows/ci.yml`).

---

## 🔗 State & API

-   Local state → React hooks.
-   Server state → TanStack Query (React Query), called through each feature's `apis/*.api.ts`.
-   All API endpoints prefixed with `/api/v1/...`.
-   Standard success response format (`src/server/http/response.ts`):

```json
{
	"success": true,
	"data": {},
	"message": "optional"
}
```

-   Standard error response format (`src/server/errors/error-handler.ts`) — note the different shape, don't assume `success`/`data` on error branches:

```json
{
	"message": "Human readable message",
	"data": null,
	"errors": {
		"code": "VALIDATION_ERROR",
		"type": "ValidationError",
		"details": {}
	}
}
```

---

## 🔐 Security

-   Sensitive variables are only stored in `.env`. **Never** commit `.env` to the repo (`.env.example` is the tracked template).
-   `APP_KEY` / `APP_COOKIE_KEY` in `.env.example` are placeholders only — generate your own with `npm run secret:generate` and never ship the example values to a real environment.
-   Protected routes require the `auth` middleware (`src/server/http/middlewares/auth.ts`); admin-only or permissioned routes additionally use `checkPermission(key)`.
-   Credential-guessing endpoints (login, register, forgot-password) should use `turnstileVerify` + a strict `rateLimit(...)` — see `src/server/http/routes/auth.routes.ts` for the pattern.

---

## Review Checklist

Before push/merge PR:

-   Does the small feature use flat structure?
-   Is the large feature separated into components, apis, hooks (and types only if actually shared)?
-   Does the file/component naming follow the convention?
-   Does frontend code avoid importing `@/server` directly (goes through `apis/*.api.ts` instead)?
-   Has reusable logic been moved to `libs/` (frontend) or the matching backend layer (`services/`, `repositories/`)?
-   Does the code pass lint & build?

---

## 🛠️ Workflow

1. Fork & clone repo.
2. Copy `.env.example` to `.env` and run `npm run secret:generate` to fill in `APP_KEY`/`APP_COOKIE_KEY` with your own values.
3. Create a new branch from `master`:

```bash
git checkout -b feat/feature-name
```

4. Commit using the convention format:

```makefile
feat: add about page
fix: fix contact form bug
chore: update eslint dependency
```

5. Push branch and create a Pull Request.

---
