# 👩‍💻 Contributing Guide

Terima kasih sudah berkontribusi pada project ini!  
Dokumen ini berisi panduan teknis untuk menjaga konsistensi kode dan struktur folder.

---

## 📂 Struktur Modularisasi Fitur

-   Semua menu/halaman ditempatkan di folder `features/[nama-fitur]`.
-   Minimal setiap fitur punya **1 file wrapper utama** (`feature-wrapper.tsx`).
-   Sub-folder (`components`, `apis`, `hooks`, `types`) hanya dibuat jika fitur cukup kompleks.

```bash
project-root/
├── app/ # Default Next.js app directory
├── components/ # Global reusable components
├── features/ # Modularisasi per fitur/menu
├── types/ # Global type definitions
├── libs/ # Helper functions, configs, utilities
├── constants/ # Konstanta global
├── db/ # Schema, migration, dan seed database
├── hono/ # Hono API routes dan middlewares
├── public/ # Asset statis
├── styles/ # Styling global
├── .env # Environment variables
├── drizzle.config.ts # Konfigurasi Drizzle ORM
├── next.config.js # Konfigurasi Next.js
└── tsconfig.json # Konfigurasi TypeScript
```

---

### ✅ Flat Structure (fitur kecil, ≤ 3 file)

Contoh: `features/about`

```bash
features/
└── about/
├── about-wrapper.tsx # komponen utama halaman
├── hooks.ts # optional
└── types.ts # optional
```

Gunakan **flat structure** untuk:

-   Halaman statis (About, Contact).
-   Hanya butuh 1–2 komponen utama.
-   Tidak ada banyak logic kompleks.

---

### ✅ Nested Structure (fitur besar, > 3 file)

Contoh: `features/home`

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

Gunakan **nested structure** untuk:

-   Halaman kompleks (Home, Careers).
-   Banyak komponen section.
-   Ada logic API, hooks, atau type khusus.
-   Membutuhkan maintainability tinggi.

---

## 📌 Naming Convention

-   **Folder & file**: `kebab-case` (contoh: `section-hero.tsx`).
-   **Komponen React**: `kebab-case` (contoh: `home-wrapper.tsx`).
-   **Hooks**: `kebab-case` (contoh: `use-home-data.ts`).
-   **Types**: akhiri dengan `.d.ts` atau prefix `T` (contoh: `TJob`, `home.d.ts`).
-   **API**: akhiri dengan `.api.ts` (contoh: `careers.api.ts`).

---

## ⚙️ Code Style

-   Gunakan **TypeScript**.
-   Ikuti linting & formatting otomatis dengan **ESLint + Prettier**.
-   Gunakan **absolute import alias** (`@/components`, `@/features`, dsb).
-   Semua PR harus lulus lint (`npm run lint`) dan build (`npm run build`).

---

## 🔗 State & API

-   Local state → React hooks.
-   Server state → TanStack Query (React Query).
-   Semua endpoint API prefix `/api/v1/...`.
-   Format response standar:

```json
{
	"success": true,
	"data": {},
	"message": "optional"
}
```

---

## 🔐 Security

-   Variabel sensitif hanya disimpan di .env.
-   Jangan pernah commit .env ke repo.
-   Middleware auth di Hono wajib untuk area proteksi.

---

## Review Checklist

Sebelum push/merge PR:

-   Apakah fitur kecil sudah pakai flat structure?
-   Apakah fitur besar sudah dipisahkan ke components, apis, hooks, types?
-   Apakah nama file/komponen sesuai aturan?
-   Apakah logic reusable dipindah ke libs/?
-   Apakah kode lulus lint & build?

---

## 🛠️ Workflow

1. Fork & clone repo.
2. Buat branch baru dari main:

```bash
git checkout -b feat/nama-fitur
```

3. Commit dengan format konvensi:

```makefile
feat: tambah halaman about
fix: perbaikan bug contact form
chore: update dependency eslint
```

4. Push branch dan buat Pull Request.

---
