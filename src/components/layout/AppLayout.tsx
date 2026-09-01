// ============================================================
// APP LAYOUT — Second Brain
// Shell: Sidebar + TopBar + main content area
// ============================================================

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [_searchOpen, setSearchOpen] = useState(false);

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
    </div>
  );
}
