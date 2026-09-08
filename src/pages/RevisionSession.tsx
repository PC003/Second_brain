// ============================================================
// REVISION SESSION — Second Brain
// Interactive flashcard-style review session
// Iterates through a queue of problem IDs
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getProblemById } from "../services/problemService";
import { completeRevision, calculateNextReviewDate } from "../services/revisionService";
import type { ProblemWithRelations } from "../types";
import { MarkdownViewer } from "../components/problems/MarkdownSection";
import { CodeViewer } from "../components/problems/CodeSection";
import EmptyState from "../components/common/EmptyState";
import { DifficultyBadge, StatusBadge } from "../components/common/StatusBadge";

export default function RevisionSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const problemId = Number(id);
  // Get queue from location state, default to just this problem if no queue
  const [queue] = useState<number[]>(location.state?.queue || [problemId]);
  
  const [problem, setProblem] = useState<ProblemWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!problemId || isNaN(problemId)) return;
    loadProblem();
    // Reset reveal state for new problem
    setRevealed(false);
  }, [problemId]);

  async function loadProblem() {
    setLoading(true);
    try {
      const data = await getProblemById(problemId);
      setProblem(data);
    } catch (err) {
      console.error("Failed to load problem:", err);
      toast.error("Failed to load problem for revision.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGrade(result: "solved" | "needed_help" | "revealed", interval: string) {
    if (!problem || saving) return;
    setSaving(true);
    
    try {
      const nextDate = calculateNextReviewDate(interval);
      await completeRevision(problem.id, result, "", nextDate);
      
      toast.success(
        result === "solved" 
          ? "Great job! Problem marked as solved." 
          : "Revision recorded."
      );

      // Move to next in queue
      const currentIndex = queue.indexOf(problem.id);
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        const nextId = queue[currentIndex + 1];
        navigate(`/revision/${nextId}`, { state: { queue } });
      } else {
        // Queue finished
        toast.success("Revision session completed!");
        navigate("/revision");
      }
    } catch (err) {
      toast.error("Failed to save revision result.");
      console.error(err);
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading problem..." />;
  }

  if (!problem) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/revision")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Revision
        </button>
        <EmptyState
          icon={<AlertCircle size={24} />}
          title="Problem not found"
          description="We couldn't load this problem for revision."
        />
      </div>
    );
  }

  const currentIndex = queue.indexOf(problem.id);
  const progressText = queue.length > 1 
    ? `Problem ${currentIndex + 1} of ${queue.length}`
    : "Single Review";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/revision")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
            title="Exit Session"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Revision Session</h1>
            <p className="text-sm text-accent font-medium mt-0.5">{progressText}</p>
          </div>
        </div>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-muted hover:text-accent transition-colors"
        >
          Open Original Problem ↗
        </a>
      </div>

      {/* Problem Card (Question) */}
      <div className="bg-surface-1 border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-2xl font-bold text-text-primary">{problem.title}</h2>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <StatusBadge status={problem.status} />
          {problem.patterns.map(p => (
            <span key={p.id} className="px-2 py-0.5 rounded text-xs font-medium bg-surface-2 text-text-secondary">
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Reveal Action OR Answer */}
      {!revealed ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-text-secondary">Try to solve this problem before looking at your notes.</p>
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            <Eye size={18} />
            Reveal My Notes
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Notes */}
          <div className="bg-surface-1 border border-border rounded-xl p-6 space-y-6 shadow-sm">
            {problem.approach && (
              <MarkdownViewer label="Approach" content={problem.approach} />
            )}
            {problem.key_observation && (
              <MarkdownViewer label="Key Observation" content={problem.key_observation} />
            )}
            {problem.algorithm && (
              <MarkdownViewer label="Algorithm" content={problem.algorithm} />
            )}
            {problem.code && (
              <CodeViewer code={problem.code} language={problem.code_language} />
            )}
            {!problem.approach && !problem.algorithm && !problem.code && (
              <p className="text-sm text-text-muted italic">No notes or code saved for this problem.</p>
            )}
          </div>

          {/* Grading Bar (Fixed to bottom for easy access) */}
          <div className="fixed bottom-0 left-[var(--sidebar-width)] right-0 p-4 bg-surface-1/90 backdrop-blur-md border-t border-border z-10 flex justify-center">
            <div className="w-full max-w-4xl flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-text-secondary hidden sm:inline-block">
                How did you do?
              </span>
              <div className="flex flex-1 sm:flex-none gap-2 sm:gap-3">
                <button
                  disabled={saving}
                  onClick={() => handleGrade("revealed", "tomorrow")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 bg-danger-subtle text-danger text-sm font-medium hover:bg-danger hover:text-white transition-colors"
                >
                  <AlertCircle size={16} />
                  Forgot
                  <span className="text-[10px] opacity-70 hidden md:inline ml-1">(Review 1d)</span>
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleGrade("needed_help", "3_days")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-warning/30 bg-warning-subtle text-warning text-sm font-medium hover:bg-warning hover:text-white transition-colors"
                >
                  <Eye size={16} />
                  Needed Help
                  <span className="text-[10px] opacity-70 hidden md:inline ml-1">(Review 3d)</span>
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleGrade("solved", "14_days")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-success/30 bg-success-subtle text-success text-sm font-medium hover:bg-success hover:text-white transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Nailed It
                  <span className="text-[10px] opacity-70 hidden md:inline ml-1">(Review 14d)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
