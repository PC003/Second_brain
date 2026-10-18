// ============================================================
// DASHBOARD PAGE — Second Brain
// High-level stats, recent problems, and quick actions
// ============================================================
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Home, Plus, BookOpen, Trophy, RefreshCcw, Swords } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getDashboardStats } from "../services/analyticsService";
import { getRecentProblems } from "../services/problemService";
import { getQueue, addToQueue, removeFromQueue } from "../services/queueService";
import { getAllPlatforms } from "../services/platformService";
import type { DashboardStats, ProblemWithRelations, ProblemQueueItemWithPlatform, Platform } from "../types";
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from "../utils/constants";
import { formatRelativeDate } from "../utils/dates";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProblems, setRecentProblems] = useState<ProblemWithRelations[]>([]);
  const [queue, setQueue] = useState<ProblemQueueItemWithPlatform[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddQueueModalOpen, setIsAddQueueModalOpen] = useState(false);
  const [newQueueTitle, setNewQueueTitle] = useState("");
  const [newQueuePlatformId, setNewQueuePlatformId] = useState<number>(0);

  useEffect(() => {
    loadDashboard();
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const all = await getAllPlatforms();
      setPlatforms(all);
      if (all.length > 0) {
        setNewQueuePlatformId(all[0].id);
      }
    } catch (err) {
      console.error("Failed to load platforms:", err);
    }
  }

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsData, recentData, queueData] = await Promise.all([
        getDashboardStats(),
        getRecentProblems(),
        getQueue(),
      ]);
      setStats(statsData);
      setRecentProblems(recentData);
      setQueue(queueData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Your DSA & Competitive Programming knowledge base
          </p>
        </div>
        <button
          onClick={() => setIsAddQueueModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-1 border border-border text-text-primary text-sm font-medium hover:bg-surface-2 transition-colors shadow-sm"
        >
          <Plus size={16} className="text-text-muted" />
          Add to Queue
        </button>
      </div>

      {/* ---- Queue Section ---- */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider text-text-muted">Problem Queue</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-72 bg-surface-1 border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-border-subtle transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-2 text-text-muted">
                      {item.platform_name}
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await removeFromQueue(item.id);
                          setQueue(queue.filter(q => q.id !== item.id));
                          toast.success("Removed from queue.");
                        } catch (err) {
                          toast.error("Failed to remove.");
                        }
                      }}
                      className="text-text-muted hover:text-danger transition-colors"
                      title="Remove from queue"
                    >
                      <Trophy size={14} className="hidden" /> {/* Placeholder for alignment */}
                      <span className="text-xs">Remove</span>
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-2">
                    {item.title}
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/add-problem", { state: { queueItem: item } })}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-accent-subtle text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-colors"
                >
                  <BookOpen size={14} />
                  Add to Knowledge Base
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <img
            src="/app-icon.png"
            alt="Second Brain Logo"
            className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-md"
          />
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
              {recentProblems.slice(0, 5).map((problem) => {
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

      {/* ---- Add Queue Modal ---- */}
      {isAddQueueModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsAddQueueModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-surface-1 border border-border rounded-xl shadow-xl w-full max-w-md shrink-0 min-w-[320px] overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-text-primary">Add Problem to Queue</h3>
              <p className="text-sm text-text-secondary">Keep track of problems you want to solve later.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Platform
                </label>
                <select
                  value={newQueuePlatformId}
                  onChange={(e) => setNewQueuePlatformId(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Problem Name
                </label>
                <input
                  type="text"
                  value={newQueueTitle}
                  onChange={(e) => setNewQueueTitle(e.target.value)}
                  placeholder="e.g. Two Sum"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-2/50 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddQueueModalOpen(false);
                  setNewQueueTitle("");
                }}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newQueueTitle.trim()) {
                    toast.error("Please enter a problem name.");
                    return;
                  }
                  if (!newQueuePlatformId) {
                    toast.error("Please select a platform.");
                    return;
                  }
                  try {
                    await addToQueue(newQueuePlatformId, newQueueTitle);
                    const updatedQueue = await getQueue();
                    setQueue(updatedQueue);
                    setIsAddQueueModalOpen(false);
                    setNewQueueTitle("");
                    toast.success("Added to queue.");
                  } catch (err) {
                    toast.error("Failed to add to queue.");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
