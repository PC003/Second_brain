// ============================================================
// SETTINGS PAGE — Second Brain (Phase 1 placeholder)
// Theme, platforms, patterns, data management — Phase 9
// ============================================================

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage your application preferences
        </p>
      </div>

      {/* ---- Appearance ---- */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Theme</label>
          <div className="flex gap-2">
            {(
              [
                { value: "dark", icon: <Moon size={16} />, label: "Dark" },
                { value: "light", icon: <Sun size={16} />, label: "Light" },
                { value: "system", icon: <Monitor size={16} />, label: "System" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  theme === opt.value
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-2 text-text-secondary border-border hover:border-accent"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Placeholder sections ---- */}
      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">Platforms</h2>
        <p className="text-sm text-text-muted">
          Platform management will be available in Phase 9.
        </p>
      </section>

      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">DSA Patterns</h2>
        <p className="text-sm text-text-muted">
          Pattern management will be available in Phase 9.
        </p>
      </section>

      <section className="bg-surface-1 border border-border rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">Data Management</h2>
        <p className="text-sm text-text-muted">
          Export, import, and backup features will be available in Phase 9.
        </p>
      </section>
    </div>
  );
}
