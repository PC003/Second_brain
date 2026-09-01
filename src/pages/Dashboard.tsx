// ============================================================
// DASHBOARD PAGE — Second Brain (Phase 1 placeholder)
// Will be populated with stats, recent problems, revision in Phase 8
// ============================================================

import { Home, Plus, BookOpen, Trophy, RefreshCcw, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your DSA & Competitive Programming knowledge base
        </p>
      </div>

      {/* ---- Stats Grid (placeholder) ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Problems", value: "0", icon: <BookOpen size={18} /> },
          { label: "Solved", value: "0", icon: <Home size={18} /> },
          { label: "To Solve", value: "0", icon: <Plus size={18} /> },
          { label: "Need Revision", value: "0", icon: <RefreshCcw size={18} /> },
          { label: "Mastered", value: "0", icon: <Trophy size={18} /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-1 border border-border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-text-muted">
              {stat.icon}
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/add-problem")}
          className="flex items-center gap-3 bg-surface-1 border border-border rounded-xl p-5 text-left card-hover group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
            <Plus size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Add Problem</p>
            <p className="text-xs text-text-muted">Store a new DSA or CP problem</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/dsa/patterns")}
          className="flex items-center gap-3 bg-surface-1 border border-border rounded-xl p-5 text-left card-hover group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
            <Swords size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Browse Patterns</p>
            <p className="text-xs text-text-muted">Explore DSA patterns & techniques</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/revision")}
          className="flex items-center gap-3 bg-surface-1 border border-border rounded-xl p-5 text-left card-hover group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
            <RefreshCcw size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Start Revision</p>
            <p className="text-xs text-text-muted">Review problems due today</p>
          </div>
        </button>
      </div>

      {/* ---- Empty state for new users ---- */}
      <div className="bg-surface-1 border border-border-subtle rounded-xl p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-text-muted mx-auto mb-4">
          <BookOpen size={28} />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Welcome to Second Brain
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto mb-5">
          Start building your programming knowledge base. Add your first problem to
          track your approach, patterns, and progress.
        </p>
        <button
          onClick={() => navigate("/add-problem")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Add Your First Problem
        </button>
      </div>
    </div>
  );
}
