// ============================================================
// REVISION DASHBOARD — Second Brain
// Shows overdue, today, and upcoming problems
// Entry point for revision sessions
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCcw, Loader2, Calendar } from "lucide-react";
import { getDueProblems, getUpcomingProblems } from "../services/revisionService";
import type { ProblemWithRelations } from "../types";
import RevisionQueue from "../components/revision/RevisionQueue";
import EmptyState from "../components/common/EmptyState";

export default function Revision() {
  const navigate = useNavigate();
  const [due, setDue] = useState<ProblemWithRelations[]>([]);
  const [upcoming, setUpcoming] = useState<ProblemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueues();
  }, []);

  async function loadQueues() {
    try {
      const [dueProbs, upcomingProbs] = await Promise.all([
        getDueProblems(),
        getUpcomingProblems(),
      ]);
      setDue(dueProbs);
      setUpcoming(upcomingProbs);
    } catch (err) {
      console.error("Failed to load revision queues:", err);
    } finally {
      setLoading(false);
    }
  }

  function startSession() {
    if (due.length === 0) return;
    // We pass the IDs of due problems to the session via state
    const ids = due.map((p) => p.id);
    navigate(`/revision/${ids[0]}`, { state: { queue: ids } });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  if (due.length === 0 && upcoming.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Revision</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Spaced repetition for your solved problems
          </p>
        </div>
        <EmptyState
          icon={<RefreshCcw size={24} />}
          title="All caught up!"
          description="You don't have any problems scheduled for revision. When you mark a problem for review, it will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Revision</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {due.length} problem{due.length !== 1 ? "s" : ""} due for review
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Due Now (Takes 2/3 width on xl screens) */}
        <div className="xl:col-span-2 space-y-6">
          <RevisionQueue
            title="Due for Review"
            problems={due}
            onStartSession={startSession}
            emptyMessage="You're all caught up for today! No problems due for review."
          />
        </div>

        {/* Right Column: Upcoming (Takes 1/3 width on xl screens) */}
        <div className="space-y-6">
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-text-muted" />
              Upcoming
            </h3>
            
            {upcoming.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No upcoming revisions scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((problem) => (
                  <div
                    key={problem.id}
                    onClick={() => navigate(`/problem/${problem.id}`)}
                    className="flex flex-col gap-1 p-3 rounded-lg border border-border-subtle bg-surface-0 hover:border-accent/40 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-text-primary truncate">
                      {problem.title}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">
                        {problem.platform_name}
                      </span>
                      <span className="text-[11px] font-medium text-text-secondary">
                        {new Date(problem.next_review_date!).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {upcoming.length > 5 && (
                  <p className="text-xs text-text-muted text-center pt-2">
                    + {upcoming.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
