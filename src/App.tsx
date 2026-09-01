// ============================================================
// APP — Second Brain
// HashRouter with all application routes
// HashRouter is required for Tauri (no web server for URL rewrites)
// ============================================================

import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import AddProblem from "./pages/AddProblem";
import EditProblem from "./pages/EditProblem";
import ProblemDetail from "./pages/ProblemDetail";
import ProblemList from "./pages/ProblemList";
import Patterns from "./pages/Patterns";
import PatternDetail from "./pages/PatternDetail";
import Revision from "./pages/Revision";
import RevisionSession from "./pages/RevisionSession";
import Contests from "./pages/Contests";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Problem CRUD */}
            <Route path="/add-problem" element={<AddProblem />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/problem/:id/edit" element={<EditProblem />} />

            {/* DSA Section */}
            <Route path="/dsa/all" element={<ProblemList />} />
            <Route path="/dsa/leetcode" element={<ProblemList />} />
            <Route path="/dsa/other" element={<ProblemList />} />
            <Route path="/dsa/patterns" element={<Patterns />} />
            <Route path="/dsa/patterns/:id" element={<PatternDetail />} />

            {/* CP Section */}
            <Route path="/cp/all" element={<ProblemList />} />
            <Route path="/cp/codeforces" element={<ProblemList />} />
            <Route path="/cp/codechef" element={<ProblemList />} />
            <Route path="/cp/atcoder" element={<ProblemList />} />
            <Route path="/cp/other" element={<ProblemList />} />
            <Route path="/cp/contests" element={<Contests />} />
            <Route path="/cp/contests/:id" element={<Contests />} />

            {/* Revision */}
            <Route path="/revision" element={<Revision />} />
            <Route path="/revision/:id" element={<RevisionSession />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>

      {/* Toast notifications — positioned top-right for desktop */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface-1)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontSize: "13px",
          },
        }}
        richColors
      />
    </ThemeProvider>
  );
}
