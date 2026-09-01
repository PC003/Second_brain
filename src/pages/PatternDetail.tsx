// ============================================================
// PATTERN DETAIL PAGE — Second Brain
// Shows problems for a specific pattern with stats
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Swords } from "lucide-react";
import { getPatternById } from "../services/patternService";
import { getProblems } from "../services/problemService";
import type { Pattern, ProblemWithRelations } from "../types";
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from "../utils/constants";
import { formatRelativeDate } from "../utils/dates";
import EmptyState from "../components/common/EmptyState";
import PatternProgress from "../components/patterns/PatternProgress";

export default function PatternDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patternId = Number(id);

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [problems, setProblems] = useState<ProblemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [patternId]);

  async function loadData() {
    setLoading(true);
    try {
      const p = await getPatternById(patternId);
      setPattern(p);
      const probs = await getProblems({ pattern_id: patternId, category: "dsa" });
      setProblems(probs);
    } catch (err) {
      console.error("Failed to load pattern:", err);
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

  if (!pattern) {
    return (
      <EmptyState
        icon={<Swords size={24} />}
        title="Pattern not found"
        description="This pattern may have been deleted."
      />
    );
  }

  const solvedCount = problems.filter(p => p.status === "solved" || p.status === "mastered").length;
  const revisionCount = problems.filter(p => p.status === "need_revision").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate("/dsa/patterns")}
          className="w-9 h-9 mt-1 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 max-w-md space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{pattern.name}</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {pattern.group_name}
            </p>
          </div>
          <PatternProgress 
            total={problems.length}
            solved={solvedCount}
            needsRevision={revisionCount}
          />
        </div>
      </div>

      {problems.length === 0 ? (
        <EmptyState
          icon={<Swords size={24} />}
          title="No problems yet"
          description={`No problems have been assigned to "${pattern.name}" yet.`}
          action={
            <button
              onClick={() => navigate("/add-problem")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              <Plus size={16} />
              Add Problem
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {problems.map((problem) => {
            const diffConfig = DIFFICULTY_CONFIG[problem.difficulty];
            const statConfig = STATUS_CONFIG[problem.status];

            return (
              <div
                key={problem.id}
                onClick={() => navigate(`/problem/${problem.id}`)}
                className="bg-surface-1 border border-border rounded-xl p-4 cursor-pointer card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-surface-2 text-text-muted">
                        {problem.platform_name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${diffConfig.bgColor} ${diffConfig.color}`}>
                        {diffConfig.label}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${statConfig.bgColor} ${statConfig.color}`}>
                        {statConfig.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    {formatRelativeDate(problem.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
