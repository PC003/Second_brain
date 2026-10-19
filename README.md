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
- 86+ built-in patterns organized by category (Two Pointers, Binary Search, DP, Graphs, etc.)
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
- **Export** entire database to Excel (.xlsx) workbook with individual sheets
- **Import** from Excel (.xlsx) or JSON (full data replacement)
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

## Development & Multi-Platform Support

### Prerequisites by Platform

#### 🍎 macOS
- Xcode Command Line Tools: `xcode-select --install`
- Node.js ≥ 18
- Rust (latest stable): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

#### 🪟 Windows
- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (pre-installed on Windows 10/11)
- Node.js ≥ 18 & Rust

#### 🐧 Linux (Ubuntu / Debian / Fedora / Arch)
- **Ubuntu/Debian**:
  ```bash
  sudo apt-get update
  sudo apt-get install -y libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev build-essential curl wget file libssl-dev libjavascriptcoregtk-4.1-dev
  ```
- **Fedora**:
  ```bash
  sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel
  ```
- **Arch Linux**:
  ```bash
  sudo pacman -S webkit2gtk-4.1 libappindicator-gtk3 librsvg
  ```

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/yourname/second-brain.git
cd second-brain

# Install frontend dependencies
npm install

# Run in development mode (launches desktop window)
npm run tauri dev
```

### Build Installers for Production
```bash
npm run tauri build
```
Output bundles will be generated in `src-tauri/target/release/bundle/`:
- **macOS**: `.dmg` and `.app`
- **Windows**: `.exe` (NSIS) and `.msi`
- **Linux**: `.deb` and `.AppImage`

### 🚀 Automated Multi-Platform Releases via GitHub Actions

A pre-configured GitHub Actions workflow ([`.github/workflows/release.yml`](.github/workflows/release.yml)) is ready to automatically build and publish release installers for every OS:

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "feat: prepare v0.1.0 release"
   git push origin main
   ```

2. **Create and push a version tag**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. **Automatic Multi-OS Matrix Build**:
   GitHub Actions will automatically launch concurrent runner machines and build:
   - **macOS Apple Silicon (M-series)**: `.dmg` installer
   - **macOS Intel (x86_64)**: `.dmg` installer
   - **Windows (x64)**: `.exe` (NSIS installer) & `.msi`
   - **Linux (x64)**: `.deb` package & `.AppImage` standalone binary

All resulting binary packages will be attached directly to your repository's **GitHub Releases** tab and saved as workflow artifacts!

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
