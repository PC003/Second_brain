// ============================================================
// APP LAYOUT — Second Brain
// Shell: Sidebar + TopBar + ErrorBoundary + SearchModal + main content area
// Handles global keyboard shortcuts
// ============================================================

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SearchModal from "../common/SearchModal";
import ErrorBoundary from "../common/ErrorBoundary";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Cross-platform modifier key (Cmd on macOS, Ctrl on Windows and Linux)
      const isMod = e.metaKey || e.ctrlKey;
      const keyLower = e.key.toLowerCase();

      // Mod+K → Search (always works)
      if (isMod && keyLower === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Skip remaining shortcuts when focused on inputs
      if (isInput) return;

      // Mod+N → Add Problem
      if (isMod && keyLower === "n") {
        e.preventDefault();
        navigate("/add-problem");
      }
      // Mod+, → Settings
      if (isMod && e.key === ",") {
        e.preventDefault();
        navigate("/settings");
      }
      // Mod+B → Toggle sidebar
      if (isMod && keyLower === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ---- Sidebar ---- */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* ---- Main ---- */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-surface-0">
          <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* ---- Search Modal ---- */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

