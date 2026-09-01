// ============================================================
// PROBLEM DETAIL PAGE — Second Brain
// Rich problem view: hero header, markdown sections, code,
// metadata sidebar, actions (edit, delete, open URL, revision)
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  Timer,
  Swords,
  Tag,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getProblemById, deleteProblem, updateProblemStatus } from "../services/problemService";
import { getRevisionHistory } from "../services/revisionService";
import { scheduleReview } from "../services/problemService";
import type { ProblemWithRelations, ProblemStatus, RevisionHistory } from "../types";
import { StatusBadge, DifficultyBadge } from "../components/common/StatusBadge";
import Badge from "../components/common/Badge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import { MarkdownViewer } from "../components/problems/MarkdownSection";
import { CodeViewer } from "../components/problems/CodeSection";
import { formatDate, formatRelativeDate, formatReviewDate, daysUntil } from "../utils/dates";
import { REVISION_SCHEDULE_OPTIONS } from "../types";

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = Number(id);

  const [problem, setProblem] = useState<ProblemWithRelations | null>(null);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!problemId || isNaN(problemId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    loadProblem();
  }, [problemId]);

  async function loadProblem() {
    try {
      const [data, history] = await Promise.all([
        getProblemById(problemId),
        getRevisionHistory(problemId),
      ]);
      if (!data) {
        setNotFound(true);
      } else {
        setProblem(data);
        setRevisionHistory(history);
      }
    } catch (err) {
      console.error("Failed to load problem:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteProblem(problemId);
      toast.success("Problem deleted.");
      navigate(-1);
    } catch (err) {
      toast.error("Failed to delete problem.");
      console.error(err);
    } finally {
      setDeleteOpen(false);
    }
  }

  async function handleStatusChange(newStatus: ProblemStatus) {
    if (!problem) return;
    try {
      const lastSolvedAt =
        newStatus === "solved" || newStatus === "mastered"
          ? new Date().toISOString()
          : undefined;
      await updateProblemStatus(problemId, newStatus, lastSolvedAt);
      setProblem({ ...problem, status: newStatus });
      toast.success(`Status updated to "${newStatus.replace("_", " ")}".`);
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function handleSchedule(days: number | null) {
    try {
      let date: string | null = null;
      if (days !== null) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        date = d.toISOString().split("T")[0];
      }
      await scheduleReview(problemId, date);
      if (problem) {
        setProblem({ ...problem, next_review_date: date });
      }
      toast.success(date ? `Review scheduled for ${formatDate(date)}.` : "Review removed.");
      setScheduleOpen(false);
    } catch {
      toast.error("Failed to schedule review.");
    }
  }

  function openInBrowser() {
    if (!problem) return;
    window.open(problem.url, "_blank");
  }

  // ---- Loading / Not Found ----

  if (loading) {
    return <LoadingSpinner label="Loading problem..." />;
  }

  if (notFound || !problem) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={16} />
          Go back
        </button>
        <EmptyState
          icon={<ArrowLeft size={24} />}
          title="Problem not found"
          description="The problem you're looking for doesn't exist or has been deleted."
        />
      </div>
    );
  }

  // ---- Revision date context ----
  const reviewDays = daysUntil(problem.next_review_date);
  const reviewDateLabel = formatReviewDate(problem.next_review_date);
  const reviewOverdue = reviewDays !== null && reviewDays < 0;
  const reviewToday = reviewDays === 0;

  // ---- Content sections that have data ----
  const sections = [
    { label: "My Approach", content: problem.approach },
    { label: "Key Observation", content: problem.key_observation },
    { label: "Algorithm", content: problem.algorithm },
    { label: "Why This Works", content: problem.why_it_works },
    { label: "My Mistake", content: problem.mistake },
    { label: "Things I Learned", content: problem.lessons },
    { label: "Additional Notes", content: problem.notes },
  ].filter((s) => s.content && s.content.trim());

  // ---- Status cycle options ----
  const statusOptions: { label: string; value: ProblemStatus }[] = [
    { label: "To Solve", value: "to_solve" },
    { label: "Solved", value: "solved" },
    { label: "Need Revision", value: "need_revision" },
    { label: "Mastered", value: "mastered" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ============ BACK + ACTIONS BAR ============ */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={openInBrowser}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-text-secondary bg-surface-2 border border-border hover:border-accent hover:text-accent transition-colors"
          >
            <ExternalLink size={13} />
            Open
          </button>
          <Link
            to={`/problem/${problemId}/edit`}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-text-secondary bg-surface-2 border border-border hover:border-accent hover:text-accent transition-colors"
          >
            <Edit3 size={13} />
            Edit
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-text-secondary bg-surface-2 border border-border hover:border-danger hover:text-danger transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>

      {/* ============ HERO HEADER ============ */}
      <div className="bg-surface-1 border border-border rounded-2xl p-6 space-y-4">
        {/* Title row */}
        <h1 className="text-2xl font-bold text-text-primary leading-tight">
          {problem.title}
        </h1>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <StatusBadge status={problem.status} />
          <Badge>{problem.platform_name}</Badge>
          <Badge>{problem.category === "dsa" ? "DSA" : "CP"}</Badge>
        </div>

        {/* URL */}
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors truncate max-w-full"
        >
          <ExternalLink size={13} className="flex-shrink-0" />
          <span className="truncate">{problem.url}</span>
        </a>

        {/* Complexity chips */}
        {(problem.time_complexity || problem.space_complexity) && (
          <div className="flex flex-wrap gap-3">
            {problem.time_complexity && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Timer size={12} className="text-text-muted" />
                Time: <code className="font-mono text-accent">{problem.time_complexity}</code>
              </span>
            )}
            {problem.space_complexity && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <Timer size={12} className="text-text-muted" />
                Space: <code className="font-mono text-accent">{problem.space_complexity}</code>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ============ MAIN CONTENT + SIDEBAR ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ---- Left: Content sections ---- */}
        <div className="space-y-6 min-w-0">
          {/* Markdown sections */}
          {sections.map((section) => (
            <div
              key={section.label}
              className="bg-surface-1 border border-border rounded-xl p-5 space-y-3"
            >
              <MarkdownViewer
                label={section.label}
                content={section.content}
              />
            </div>
          ))}

          {/* Code */}
          {problem.code && problem.code.trim() && (
            <div className="bg-surface-1 border border-border rounded-xl p-5">
              <CodeViewer code={problem.code} language={problem.code_language} />
            </div>
          )}

          {/* Empty content */}
          {sections.length === 0 && !problem.code?.trim() && (
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-10 text-center">
              <p className="text-sm text-text-muted mb-3">No notes or code added yet.</p>
              <Link
                to={`/problem/${problemId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Edit3 size={14} />
                Add Notes
              </Link>
            </div>
          )}
        </div>

        {/* ---- Right: Sidebar ---- */}
        <div className="space-y-4">
          {/* Status change card */}
          <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Status
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                    problem.status === opt.value
                      ? "bg-accent-subtle text-accent border-accent/30"
                      : "bg-surface-2 text-text-secondary border-border hover:border-accent/40 hover:text-text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review schedule card */}
          <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Review Schedule
              </h3>
              <button
                onClick={() => setScheduleOpen(!scheduleOpen)}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                {scheduleOpen ? "Close" : "Change"}
              </button>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                reviewOverdue
                  ? "bg-danger-subtle text-danger"
                  : reviewToday
                  ? "bg-warning-subtle text-warning"
                  : "bg-surface-2 text-text-secondary"
              }`}
            >
              <RefreshCcw size={14} />
              {reviewDateLabel}
            </div>

            {scheduleOpen && (
              <div className="space-y-1 animate-fade-in">
                {REVISION_SCHEDULE_OPTIONS.filter((o) => o.value !== "custom").map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleSchedule(opt.value === "none" ? null : opt.days ?? null)
                    }
                    className="w-full text-left px-3 py-1.5 rounded-md text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Patterns */}
          {problem.patterns.length > 0 && (
            <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Swords size={12} />
                Patterns
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {problem.patterns.map((p) => (
                  <Link
                    key={p.id}
                    to={`/dsa/patterns/${p.id}`}
                    className="px-2.5 py-1 rounded-md bg-accent-subtle text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {problem.tags.length > 0 && (
            <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={12} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary text-xs font-medium border border-border-subtle"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata card */}
          <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Metadata
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-text-muted" />
                <span>Added {formatRelativeDate(problem.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-text-muted" />
                <span>Updated {formatRelativeDate(problem.updated_at)}</span>
              </div>
              {problem.last_solved_at && (
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-text-muted" />
                  <span>Last solved {formatRelativeDate(problem.last_solved_at)}</span>
                </div>
              )}
              {problem.last_reviewed_at && (
                <div className="flex items-center gap-2">
                  <RefreshCcw size={12} className="text-text-muted" />
                  <span>Last reviewed {formatRelativeDate(problem.last_reviewed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Revision History */}
          {revisionHistory.length > 0 && (
            <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-3">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center gap-1.5 w-full text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
              >
                {historyOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Revision History ({revisionHistory.length})
              </button>
              {historyOpen && (
                <div className="space-y-2 animate-fade-in">
                  {revisionHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2 text-xs"
                    >
                      <span className="text-text-secondary">
                        {formatDate(entry.reviewed_at)}
                      </span>
                      <Badge
                        variant={
                          entry.result === "solved"
                            ? "success"
                            : entry.result === "needed_help"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {entry.result === "solved"
                          ? "Solved"
                          : entry.result === "needed_help"
                          ? "Needed Help"
                          : "Revealed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============ DELETE CONFIRMATION ============ */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Problem"
        message={`Are you sure you want to delete "${problem.title}"? This will also remove all associated revision history. This action cannot be undone.`}
        confirmLabel="Delete Problem"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
