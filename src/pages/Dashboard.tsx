// ============================================================
// DASHBOARD PAGE — Second Brain
// High-level stats, recent problems, and quick actions
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, BookOpen, Trophy, RefreshCcw, Swords, Loader2 } from "lucide-react";
import { getDashboardStats } from "../services/analyticsService";
import { getRecentProblems } from "../services/problemService";
import type { DashboardStats, ProblemWithRelations } from "../types";
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from "../utils/constants";
import { formatRelativeDate } from "../utils/dates";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProblems, setRecentProblems] = useState<ProblemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        getDashboardStats(),
        getRecentProblems(5),
      ]);
      setStats(statsData);
      setRecentProblems(recentData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your DSA & Competitive Programming knowledge base
        </p>
      </div>

      {/* ---- Stats Grid ---- */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Problems", value: stats.total, icon: <BookOpen size={18} /> },
            { label: "Solved", value: stats.solved, icon: <Home size={18} /> },
            { label: "To Solve", value: stats.to_solve, icon: <Plus size={18} /> },
            { label: "Need Revision", value: stats.need_revision, icon: <RefreshCcw size={18} /> },
            { label: "Mastered", value: stats.mastered, icon: <Trophy size={18} /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-1 border border-border rounded-xl p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-center gap-2 text-text-muted">
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

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

      {/* ---- Recent Problems & Welcome State ---- */}
      {stats?.total === 0 ? (
        <div className="bg-surface-1 border border-border-subtle rounded-xl p-10 text-center shadow-sm">
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
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">Recently Updated</h2>
          <div className="bg-surface-1 border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border-subtle">
              {recentProblems.map((problem) => {
                const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
                const statConfig = STATUS_CONFIG[problem.status];

                return (
                  <div
                    key={problem.id}
                    onClick={() => navigate(`/problem/${problem.id}`)}
                    className="flex items-center justify-between px-5 py-4 hover:bg-surface-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-text-muted">{problem.platform_name}</span>
                          <span className={`text-[11px] font-medium ${diffConfig.color}`}>
                            {diffConfig.label}
                          </span>
                          <span className={`text-[11px] font-medium ${statConfig.color}`}>
                            {statConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap pl-4">
                      {formatRelativeDate(problem.updated_at)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-0/50">
              <button
                onClick={() => navigate("/dsa/all")}
                className="text-sm font-medium text-accent hover:underline"
              >
                View all problems →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
