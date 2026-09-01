// ============================================================
// REVISION QUEUE — Second Brain
// List view for problems due for revision
// ============================================================

import { useNavigate } from "react-router-dom";
import { Play, Calendar, AlertCircle } from "lucide-react";
import type { ProblemWithRelations } from "../../types";
import { DIFFICULTY_CONFIG } from "../../utils/constants";
import { formatReviewDate, daysUntil } from "../../utils/dates";

interface RevisionQueueProps {
  problems: ProblemWithRelations[];
  title: string;
  onStartSession?: () => void;
  emptyMessage?: string;
}

export default function RevisionQueue({
  problems,
  title,
  onStartSession,
  emptyMessage = "No problems in this queue",
}: RevisionQueueProps) {
  const navigate = useNavigate();

  if (problems.length === 0) {
    return (
      <div className="bg-surface-1 border border-border rounded-xl p-6 text-center">
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-0/50">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
          {title}
          <span className="px-2 py-0.5 rounded-full text-xs bg-surface-2 text-text-secondary">
            {problems.length}
          </span>
        </h3>
        {onStartSession && problems.length > 0 && (
          <button
            onClick={onStartSession}
            className="flex items-center gap-2 h-8 px-3 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-sm shadow-accent/20"
          >
            <Play size={12} fill="currentColor" />
            Start Session
          </button>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-border-subtle">
        {problems.map((problem) => {
          const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
          const days = daysUntil(problem.next_review_date);
          const isOverdue = days !== null && days < 0;

          return (
            <div
              key={problem.id}
              onClick={() => navigate(`/problem/${problem.id}`)}
              className="flex items-center justify-between px-5 py-3 hover:bg-surface-2 cursor-pointer transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                    {problem.title}
                  </h4>
                  {isOverdue && (
                    <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-danger bg-danger-subtle px-1.5 py-0.5 rounded">
                      <AlertCircle size={10} />
                      Overdue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-text-muted">{problem.platform_name}</span>
                  <span className={`text-[11px] ${diffConfig.color}`}>{diffConfig.label}</span>
                  {problem.patterns.length > 0 && (
                    <>
                      <span className="text-[11px] text-border-subtle">•</span>
                      <span className="text-[11px] text-accent truncate max-w-[120px]">
                        {problem.patterns[0].name}
                        {problem.patterns.length > 1 && ` +${problem.patterns.length - 1}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-text-muted whitespace-nowrap">
                <Calendar size={13} />
                {formatReviewDate(problem.next_review_date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
