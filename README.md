# Second Brain

A powerful desktop knowledge base for **DSA** (Data Structures & Algorithms) and **Competitive Programming**. Built with Tauri 2, React 19, and SQLite — it runs natively on macOS, Windows, and Linux with zero cloud dependency.

## Features

### 📚 Problem Management
- Store problems from LeetCode, Codeforces, CodeChef, AtCoder, and custom platforms
- Rich markdown editor for approach, key observation, algorithm, and notes
- Code editor with syntax highlighting (C++, Python, Java, JavaScript)
- Full-text search across all text fields (FTS5)
- Filter by platform, difficulty, status, pattern, and tag
- Sort by date, title, difficulty, and more

### 🧩 DSA Patterns
- 50+ built-in patterns organized by category (Two Pointers, Binary Search, DP, Graphs, etc.)
- Pattern browser with problem count and progress tracking
- Add custom patterns and groups
- Link problems to multiple patterns

### 🏆 Competitive Programming
- Track contests with rating changes (before/after/delta)
- Link contest problems to your knowledge base
- Platform-specific views for Codeforces, CodeChef, AtCoder

### 🔄 Spaced Repetition
- Schedule problems for future review
- Flashcard-style revision sessions
- Three-grade system: "Nailed It" / "Needed Help" / "Forgot"
- Automatic rescheduling based on performance
- Due and upcoming revision queues

### 📊 Analytics
- Cumulative progress chart over time
- Difficulty distribution (pie chart)
- Platform distribution (bar chart)
- Top patterns by problem count
- DSA vs CP breakdown

### ⚙️ Settings & Data Management
- Dark / Light / System theme with persistence
- Platform CRUD (add, edit, delete with "in use" protection)
- Pattern CRUD with inline editing and group management
- **Export** entire database to JSON
- **Import** from JSON (full data replacement)
- **Reset** all data with double-confirmation safety

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Tauri 2](https://tauri.app) (Rust backend, WebView frontend) |
| Frontend | React 19 + TypeScript |
| Styling | TailwindCSS 4 |
| Build | Vite 7 |
| Database | SQLite via `tauri-plugin-sql` |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Toasts | Sonner |
| Markdown | react-markdown + @uiw/react-md-editor |

---

## Development

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 18
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Setup
```bash
# Clone the repo
git clone https://github.com/yourname/second-brain.git
cd second-brain

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Build for Production
```bash
npm run tauri build
```
Output binaries will be in `src-tauri/target/release/bundle/`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Global search |
| `⌘N` | Add new problem |
| `⌘,` | Open settings |
| `⌘B` | Toggle sidebar |
| `Esc` | Close modal / cancel |

---

## Data Management

### Export Format

The JSON export contains a snapshot of your entire database:

```json
{
  "version": 1,
  "exported_at": "2025-01-15T10:30:00.000Z",
  "platforms": [...],
  "patterns": [...],
  "tags": [...],
  "problems": [...],
  "problem_patterns": [...],
  "problem_tags": [...],
  "contests": [...],
  "contest_problems": [...],
  "revision_history": [...]
}
```

### Import
Import replaces **all** existing data with the contents of the JSON file. The schema version is validated before import.

### Reset
Clears all data from the database. Default platforms and patterns will be restored on the next app restart (via SQLite migrations).

---

## Project Structure

```
src/                          # React frontend
├── components/               # Reusable UI components
│   ├── common/               # Badge, ConfirmDialog, EmptyState, ErrorBoundary,
│   │                         # LoadingSpinner, SearchModal, StatusBadge
│   ├── layout/               # AppLayout, Sidebar, TopBar
│   ├── patterns/             # PatternModal, PatternProgress
│   ├── problems/             # CodeSection, MarkdownSection, ProblemForm
│   └── revision/             # RevisionQueue
├── context/                  # ThemeContext (dark/light/system)
├── pages/                    # Route-level page components
├── services/                 # Database access layer (one per entity)
├── types/                    # TypeScript interfaces & enums
└── utils/                    # Constants, date helpers, validation

src-tauri/                    # Rust backend
├── src/                      # Plugin registration & migrations
├── migrations/               # SQLite schema, seed data, alterations
└── capabilities/             # Tauri permission config
```

---

## Database

SQLite database (`second_brain.db`) with 9 tables:

- `platforms` — Coding platforms (LeetCode, Codeforces, etc.)
- `problems` — Problem entries with full metadata
- `patterns` — DSA patterns (Two Pointers, DP, etc.)
- `problem_patterns` — Many-to-many junction
- `tags` — CP tags (greedy, math, etc.)
- `problem_tags` — Many-to-many junction
- `contests` — Contest entries with ratings
- `contest_problems` — Contest-problem links
- `revision_history` — Spaced repetition log

Full-text search is powered by SQLite FTS5 across problem text fields, kept in sync via triggers.

---

## License

MIT
