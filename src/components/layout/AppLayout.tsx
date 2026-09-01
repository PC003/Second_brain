// ============================================================
// APP LAYOUT — Second Brain
// Shell: Sidebar + TopBar + SearchModal + main content area
// Handles global keyboard shortcuts
// ============================================================

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SearchModal from "../common/SearchModal";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K → Search
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Cmd+N → Add Problem
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        navigate("/add-problem");
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
        <TopBar onSearchOpen={() => setSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-surface-0">
          <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ---- Search Modal ---- */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
