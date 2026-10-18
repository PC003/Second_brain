# Second Brain — Codebase Memory

> **Last updated:** 2026-09-07
> **App:** DSA & Competitive Programming knowledge base
> **Stack:** Tauri 2 + React 19 + TypeScript + SQLite + TailwindCSS 4 + Vite 7

---

## Architecture Overview

```
Second_brain/
├── src/                          # React frontend
│   ├── App.tsx                   # HashRouter, routes, Toaster (sonner)
│   ├── main.tsx                  # ReactDOM entry
│   ├── index.css                 # Design system (Tailwind @theme, dark/light vars)
│   ├── fonts.css                 # Font imports
│   ├── vite-env.d.ts
│   ├── context/
│   │   └── ThemeContext.tsx       # Dark/Light/System, localStorage persistence
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx         # Generic badge (variant: success/danger/warning/info/accent)
│   │   │   ├── ConfirmDialog.tsx # Modal confirm dialog with portal
│   │   │   ├── EmptyState.tsx    # Icon + title + description + optional CTA
│   │   │   ├── ErrorBoundary.tsx # Global error boundary for unhandled exceptions
│   │   │   ├── LoadingSpinner.tsx # Sizes: sm/md/lg, optional label
│   │   │   ├── SearchModal.tsx   # Cmd+K global search, FTS, keyboard nav
│   │   │   └── StatusBadge.tsx   # DifficultyBadge + StatusBadge exports
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Shell: Sidebar + TopBar + Outlet + SearchModal
│   │   │   ├── Sidebar.tsx       # Collapsible nav, NavItem, NavSection components
│   │   │   └── TopBar.tsx        # Search trigger, theme toggle, Add Problem btn
│   │   ├── patterns/
│   │   │   ├── PatternModal.tsx   # Create/edit pattern modal
│   │   │   └── PatternProgress.tsx # Progress bar for pattern stats
│   │   ├── problems/
│   │   │   ├── CodeSection.tsx    # CodeViewer component
│   │   │   ├── DrawingBoard.tsx   # Persistent canvas for rough work
│   │   │   ├── MarkdownSection.tsx # MarkdownViewer component
│   │   │   └── ProblemForm.tsx    # Full problem create/edit form
│   │   └── revision/
│   │       └── RevisionQueue.tsx  # Due problems list with start session btn
│   ├── pages/
│   │   ├── Dashboard.tsx         # Stats grid, quick actions, recent problems
│   │   ├── AddProblem.tsx        # Wraps ProblemForm in create mode
│   │   ├── EditProblem.tsx       # Wraps ProblemForm in edit mode
│   │   ├── ProblemDetail.tsx     # Full problem view with all sections
│   │   ├── ProblemList.tsx       # Shared DSA/CP list with filters & sorting
│   │   ├── Patterns.tsx          # Pattern browser grouped by category
│   │   ├── PatternDetail.tsx     # Single pattern with linked problems
│   │   ├── Revision.tsx          # Due + upcoming revision queues
│   │   ├── RevisionSession.tsx   # Flashcard review with grading
│   │   ├── Contests.tsx          # Contest list + detail view
│   │   ├── Analytics.tsx         # Recharts: line, pie, bar charts
│   │   └── Settings.tsx          # ⚠️ PLACEHOLDER — only theme works
│   ├── services/
│   │   ├── database.ts           # Singleton SQLite via @tauri-apps/plugin-sql
│   │   ├── problemService.ts     # Full CRUD, search, filtering, sorting
│   │   ├── platformService.ts    # CRUD + isPlatformInUse check
│   │   ├── patternService.ts     # CRUD + stats + grouped queries
│   │   ├── tagService.ts         # CRUD + stats for CP tags
│   │   ├── revisionService.ts    # Due/upcoming queries, complete revision
│   │   ├── contestService.ts     # CRUD for contests + contest_problems
│   │   ├── analyticsService.ts   # Dashboard stats, charts data queries
│   │   ├── dataService.ts        # Export, import, backup functionality
│   │   └── integrationService.ts # HTTP integration for platform sync
│   ├── types/
│   │   └── index.ts              # All TS interfaces (290 lines)
│   └── utils/
│       ├── constants.ts          # STATUS_CONFIG, DIFFICULTY_CONFIG, SHORTCUTS, DB_NAME
│       ├── dates.ts              # formatRelativeDate, date helpers
│       └── validation.ts         # Form validation helpers
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   └── lib.rs                # Plugin registration + migrations (NO custom commands)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # 7 tables, indexes, FTS5
│   │   ├── 002_seed_data.sql      # Default platforms + 50+ DSA patterns
│   │   ├── 003_add_drawing.sql    # rough_work column
│   │   └── 004_add_profile_stats.sql # Profile stats migration
│   ├── capabilities/
│   │   └── default.json          # Permissions: core, opener, sql, dialog, fs
│   ├── Cargo.toml                # Dependencies: tauri 2, serde, sql, dialog, fs, opener
│   └── tauri.conf.json           # Window: 1280x800, min 1000x700
├── package.json                  # React deps, Tailwind 4, Recharts, sonner, lucide-react
├── vite.config.ts
└── tsconfig.json
```

---

## Database Schema (SQLite)

### Tables

| Table | PK | Key Columns | Foreign Keys |
|---|---|---|---|
| `platforms` | `id` AUTO | `name` UNIQUE, `type` (dsa/cp/both), `profile_username`, `last_synced_at`, `stats_json` | — |
| `problems` | `id` AUTO | `title`, `url` UNIQUE, `category` (dsa/cp), `difficulty`, `status`, `approach`, `key_observation`, `algorithm`, `why_it_works`, `time_complexity`, `space_complexity`, `mistake`, `lessons`, `notes`, `rough_work`, `code`, `code_language`, `next_review_date`, timestamps | `platform_id → platforms(id) RESTRICT` |
| `patterns` | `id` AUTO | `name`, `group_name`, `is_default` (0/1) | — (UNIQUE on name+group_name) |
| `problem_patterns` | composite | `problem_id`, `pattern_id` | CASCADE both |
| `tags` | `id` AUTO | `name` UNIQUE, `type` (cp/custom) | — |
| `problem_tags` | composite | `problem_id`, `tag_id` | CASCADE both |
| `contests` | `id` AUTO | `name`, `platform_id`, `url`, `contest_date`, `rating_before/change/after`, `notes` | `platform_id → platforms(id) RESTRICT` |
| `contest_problems` | `id` AUTO | `contest_id`, `problem_id` (nullable), `problem_label`, `solved`, `time_taken`, `notes` | `contest_id CASCADE`, `problem_id SET NULL` |
| `revision_history` | `id` AUTO | `problem_id`, `reviewed_at`, `result` (solved/needed_help/revealed), `notes` | `problem_id CASCADE` |

### FTS5

- Virtual table `problems_fts` on: title, approach, key_observation, algorithm, why_it_works, mistake, lessons, notes
- Synced via INSERT/UPDATE/DELETE triggers

### DB Connection

- `database.ts` → singleton `Database.load("sqlite:second_brain.db")`
- `execute(sql, params)` → returns `{ rowsAffected, lastInsertId }`
- `select<T>(sql, params)` → returns `T[]`
- PRAGMA `trusted_schema = ON` for FTS triggers

---

## Key TypeScript Types

```typescript
type Category = "dsa" | "cp"
type Difficulty = "easy" | "medium" | "hard"
type ProblemStatus = "to_solve" | "solved" | "need_revision" | "mastered"
type RevisionResult = "solved" | "needed_help" | "revealed"
type PlatformType = "dsa" | "cp" | "both"
type TagType = "cp" | "custom"
type CodeLanguage = "cpp" | "python" | "java" | "javascript" | "other"
type ThemeMode = "dark" | "light" | "system"
```

Key interfaces: `Problem`, `ProblemWithRelations`, `ProblemFormData`, `Platform`, `Pattern`, `PatternWithStats`, `Tag`, `Contest`, `ContestWithRelations`, `RevisionHistory`, `ProblemFilters`, `DashboardStats`

---

## Design System

### CSS Variables (defined in `index.css`)

**Surfaces:** `--surface-0` (darkest bg) → `--surface-3` (lightest card)
**Text:** `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
**Accent:** `--accent` (#6366f1 dark / #4f46e5 light), `--accent-hover`, `--accent-subtle`
**Semantic:** `--success`, `--warning`, `--danger`, `--info` + `*-subtle` variants
**Difficulty:** `--color-easy` (#22c55e), `--color-medium` (#f59e0b), `--color-hard` (#ef4444)
**Layout:** `--sidebar-width: 260px`, `--sidebar-collapsed-width: 64px`, `--topbar-height: 56px`

### Utility Classes (custom in `@layer components`)

- `.sidebar-transition` — width/padding 200ms
- `.card-hover` — bg/border/shadow on hover
- `.focus-ring` — 2px accent outline
- `.kbd` — keyboard key styling
- `.status-dot` — 8px colored circle
- `.markdown-content` — full markdown rendering styles

### Animations

- `.animate-fade-in` — translateY(4px) → 0
- `.animate-slide-in` — translateX(8px) → 0
- `.animate-scale-in` — scale(0.96) → 1
- `.animate-slide-up` — translateY(16px) → 0

---

## Routing (HashRouter)

| Path | Page | Notes |
|---|---|---|
| `/` | Dashboard | Stats + recent problems |
| `/add-problem` | AddProblem | ProblemForm create mode |
| `/problem/:id` | ProblemDetail | Full view |
| `/problem/:id/edit` | EditProblem | ProblemForm edit mode |
| `/dsa/all` | ProblemList | category=dsa filter |
| `/dsa/leetcode` | ProblemList | platform=LeetCode filter |
| `/dsa/other` | ProblemList | platform=Other filter |
| `/dsa/patterns` | Patterns | Pattern browser |
| `/dsa/patterns/:id` | PatternDetail | Single pattern |
| `/cp/all` | ProblemList | category=cp filter |
| `/cp/codeforces` | ProblemList | platform=Codeforces |
| `/cp/codechef` | ProblemList | platform=CodeChef |
| `/cp/atcoder` | ProblemList | platform=AtCoder |
| `/cp/other` | ProblemList | platform=Other |
| `/cp/contests` | Contests | List view |
| `/cp/contests/:id` | Contests | Detail view |
| `/revision` | Revision | Due + upcoming queues |
| `/revision/:id` | RevisionSession | Flashcard review |
| `/analytics` | Analytics | Charts (Recharts) |
| `/settings` | Settings | Theme, Platforms (with API Sync), Patterns (Data management pending) |

---

## Dependencies

### Frontend (package.json)
- `react` 19, `react-dom` 19, `react-router-dom` 7
- `@tauri-apps/api` 2, `@tauri-apps/plugin-sql` 2.4, `@tauri-apps/plugin-dialog` 2.7, `@tauri-apps/plugin-fs` 2.5, `@tauri-apps/plugin-opener` 2, `@tauri-apps/plugin-http` 2.0
- `lucide-react` (icons), `recharts` 3.10 (charts), `sonner` 2 (toasts)
- `@uiw/react-md-editor` 4, `@uiw/react-textarea-code-editor` 3
- `react-markdown` 10, `rehype-highlight` 7
- `tailwindcss` 4.3 + `@tailwindcss/vite`

### Rust (Cargo.toml)
- `tauri` 2, `serde` + `serde_json`
- `tauri-plugin-sql` 2.4 (sqlite), `tauri-plugin-dialog` 2.7, `tauri-plugin-fs` 2.5, `tauri-plugin-opener` 2, `tauri-plugin-http` 2.0 (with `unsafe-headers`)

---

## Tauri Capabilities (`capabilities/default.json`)

```json
["core:default", "opener:default", "sql:default", "sql:allow-execute",
 "sql:allow-select", "sql:allow-load", "dialog:default", "fs:default", "http:default"]
```

---

## Existing Patterns & Conventions

### Service pattern
- Each entity has a `*Service.ts` in `src/services/`
- Uses `execute()` / `select<T>()` from `database.ts`
- Parameterized queries with `$1, $2, ...` syntax
- `now()` helper returns ISO string
- Relations hydrated with separate queries (patterns, tags for problems)

### Page pattern
- `useState` + `useEffect` for data loading
- `loading` state → `<Loader2>` spinner (should be `<LoadingSpinner>`)
- `try/catch` with `console.error` (⚠️ no user-visible error toasts in most pages)
- `animate-fade-in` class on root div
- Header → Content → Empty state structure

### Component patterns
- All components use Tailwind utility classes
- Design tokens via CSS custom properties → Tailwind `@theme`
- Icons from `lucide-react`, typically `size={16-24}`
- `card-hover` class for interactive cards
- Modals use `createPortal` to `document.body`

### Keyboard shortcuts (already implemented in AppLayout)
- `⌘K` → Search modal
- `⌘N` → Navigate to /add-problem

### Toast usage
- `import { toast } from "sonner"` 
- `toast.success()`, `toast.error()` — only in AddProblem, EditProblem, RevisionSession currently

---

## What's Complete vs Pending

### ✅ Complete
- Full problem CRUD with markdown editor + code editor + drawing board
- Platform & tag management (service layer)
- Pattern browser with stats + CRUD modal
- FTS5 full-text search with Cmd+K
- Revision system with spaced repetition
- Contest tracking with rating changes
- Analytics with Recharts (line, pie, bar) + Connected Profiles stats
- Dark/Light/System theme
- Collapsible sidebar navigation
- API Integration: Sync LeetCode/Codeforces stats via `tauri-plugin-http`
- Contest Syncing: Fetch Codeforces and LeetCode contests automatically via API
- Settings Page: Theme toggle, Platform management (with API Sync), Pattern management
- Data Management: Export/import/backup functionality via `dataService.ts`
- Error handling: Added `ErrorBoundary.tsx` component
- README updated from default Tauri template

### ⚠️ Pending (Polish & Technical Debt)
- Replace inline `<Loader2>` with `<LoadingSpinner>` across all pages
- Standardize user-visible error handling (e.g., replace console.error with `toast.error()`)
- Add more keyboard shortcuts beyond ⌘K and ⌘N
- Improve data management documentation

---

## Seed Data (from 002_seed_data.sql)

### Default Platforms (6)
LeetCode (dsa), Codeforces (cp), CodeChef (cp), AtCoder (cp), GeeksforGeeks (both), Other (both)

### Default Patterns (50+, grouped)
Groups: Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heap / Priority Queue, Backtracking, Graphs, Dynamic Programming, Greedy, Intervals, Math & Bit Manipulation

### Default Tags (15+)
implementation, constructive, math, greedy, dp, binary search, brute force, data structures, graphs, number theory, sortings, strings, combinatorics, geometry, interactive
