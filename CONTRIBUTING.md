# 👩‍💻 Contributing Guide

Thank you for contributing to this project!
This document contains technical guidelines to keep the code and folder structure consistent.

---

## 📂 Feature Modularization Structure

-   All menus/pages are placed in the `features/[feature-name]` folder.
-   Each feature should have at least **1 main wrapper file** (`feature-wrapper.tsx`).
-   Sub-folders (`components`, `apis`, `hooks`, `types`) are only created if the feature is complex enough.

```bash
project-root/
├── app/ # Default Next.js app directory
├── components/ # Global reusable components
├── features/ # Modularization per feature/menu
├── types/ # Global type definitions
├── libs/ # Helper functions, configs, utilities
├── constants/ # Global constants
├── db/ # Schema, migration, and database seed
├── hono/ # Hono API routes and middlewares
├── public/ # Static assets
├── styles/ # Global styling
├── .env # Environment variables
├── drizzle.config.ts # Drizzle ORM configuration
├── next.config.js # Next.js configuration
└── tsconfig.json # TypeScript configuration
```

---

### ✅ Flat Structure (small feature, ≤ 3 files)

Example: `features/about`

```bash
features/
└── about/
├── about-wrapper.tsx # main page component
├── hooks.ts # optional
└── types.ts # optional
```

Use **flat structure** for:

-   Static pages (About, Contact).
-   Only 1–2 main components needed.
-   No complex logic.

---

### ✅ Nested Structure (large feature, > 3 files)

Example: `features/home`

```bash
features/
└── home/
├── components/
│ ├── section-hero.tsx
│ ├── section-about.tsx
│ ├── home-wrapper.tsx
│ └── ...
├── apis/
│ └── home.api.ts
├── hooks/
│ └── use-home-data.ts
├── types/
│ └── home.d.ts
└── index.ts
```

Use **nested structure** for:

-   Complex pages (Home, Careers).
-   Many section components.
-   API logic, hooks, or specific types involved.
-   High maintainability required.

---

## 📌 Naming Convention

-   **Folder & file**: `kebab-case` (example: `section-hero.tsx`).
-   **React Component**: `kebab-case` (example: `home-wrapper.tsx`).
-   **Hooks**: `kebab-case` (example: `use-home-data.ts`).
-   **Types**: end with `.d.ts` or prefix `T` (example: `TJob`, `home.d.ts`).
-   **API**: end with `.api.ts` (example: `careers.api.ts`).

---

## ⚙️ Code Style

-   Use **TypeScript**.
-   Follow automatic linting & formatting with **ESLint + Prettier**.
-   Use **absolute import alias** (`@/components`, `@/features`, etc).
-   All PRs must pass lint (`npm run lint`) and build (`npm run build`).

---

## 🔗 State & API

-   Local state → React hooks.
-   Server state → TanStack Query (React Query).
-   All API endpoints prefixed with `/api/v1/...`.
-   Standard response format:

```json
{
	"success": true,
	"data": {},
	"message": "optional"
}
```

---

## 🔐 Security

-   Sensitive variables are only stored in .env.
-   Never commit .env to the repo.
-   Auth middleware in Hono is required for protected areas.

---

## Review Checklist

Before push/merge PR:

-   Does the small feature use flat structure?
-   Is the large feature separated into components, apis, hooks, types?
-   Does the file/component naming follow the convention?
-   Has reusable logic been moved to libs/?
-   Does the code pass lint & build?

---

## 🛠️ Workflow

1. Fork & clone repo.
2. Create a new branch from main:

```bash
git checkout -b feat/feature-name
```

3. Commit using the convention format:

```makefile
feat: add about page
fix: fix contact form bug
chore: update eslint dependency
```

4. Push branch and create a Pull Request.

---
