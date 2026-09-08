// ============================================================
// TOPBAR — Second Brain
// Global search trigger, breadcrumb, and quick actions
// ============================================================

import { Plus, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const cycleTheme = () => {
    const order = ["dark", "light", "system"] as const;
    const currentIndex = order.indexOf(theme as (typeof order)[number]);
    const next = order[(currentIndex + 1) % order.length];
    setTheme(next);
  };

  const themeIcon =
    theme === "dark" ? <Moon size={16} /> : theme === "light" ? <Sun size={16} /> : <Monitor size={16} />;

  return (
    <header className="flex items-center h-[var(--topbar-height)] px-5 border-b border-border bg-surface-1/80 backdrop-blur-sm">
      {/* ---- Search ---- */}
      {/* Search feature is still available via Cmd+K, button hidden as requested */}
      <div className="flex-1 max-w-md"></div>

      {/* ---- Spacer ---- */}
      <div className="flex-1" />

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
          title={`Theme: ${theme}`}
        >
          {themeIcon}
        </button>

        {/* Add Problem */}
        <button
          onClick={() => navigate("/add-problem")}
          className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          <span>Add Problem</span>
        </button>
      </div>
    </header>
  );
}
