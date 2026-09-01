// ============================================================
// CONTESTS PAGE — Second Brain
// View and manage Competitive Programming contests
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, TrendingUp, TrendingDown, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { getAllContests, getContestById } from "../services/contestService";
import type { ContestWithRelations } from "../types";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";

export default function Contests() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [contests, setContests] = useState<ContestWithRelations[]>([]);
  const [activeContest, setActiveContest] = useState<ContestWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadContestDetail(Number(id));
    } else {
      loadAllContests();
    }
  }, [id]);

  async function loadAllContests() {
    setLoading(true);
    try {
      const data = await getAllContests();
      setContests(data);
    } catch (err) {
      console.error("Failed to load contests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadContestDetail(contestId: number) {
    setLoading(true);
    try {
      const data = await getContestById(contestId);
      setActiveContest(data);
    } catch (err) {
      console.error("Failed to load contest detail:", err);
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

  // --- DETAIL VIEW ---
  if (id) {
    if (!activeContest) {
      return (
        <EmptyState
          icon={<Trophy size={24} />}
          title="Contest not found"
          description="This contest may have been deleted."
        />
      );
    }

    const { rating_change } = activeContest;
    const isPositive = rating_change && rating_change > 0;
    const isNegative = rating_change && rating_change < 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cp/contests")}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">{activeContest.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
              <span className="font-medium">{activeContest.platform_name}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {activeContest.contest_date || "Unknown date"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-text-muted font-medium mb-1">Old Rating</p>
            <p className="text-2xl font-bold text-text-primary">
              {activeContest.rating_before || "—"}
            </p>
          </div>
          <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-text-muted font-medium mb-1">Change</p>
            <p className={`text-2xl font-bold flex items-center gap-2 ${
              isPositive ? "text-success" : isNegative ? "text-danger" : "text-text-primary"
            }`}>
              {isPositive && <TrendingUp size={20} />}
              {isNegative && <TrendingDown size={20} />}
              {rating_change ? (isPositive ? `+${rating_change}` : rating_change) : "—"}
            </p>
          </div>
          <div className="bg-surface-1 border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-text-muted font-medium mb-1">New Rating</p>
            <p className="text-2xl font-bold text-text-primary">
              {activeContest.rating_after || "—"}
            </p>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-surface-1 border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border-subtle bg-surface-0/50">
            <h3 className="font-semibold text-text-primary">Problems</h3>
          </div>
          {activeContest.problems.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">
              No problems linked to this contest.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {activeContest.problems.map((prob) => (
                <div key={prob.id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center font-bold text-text-secondary">
                      {prob.problem_label}
                    </span>
                    <div>
                      {prob.problem_id ? (
                        <button 
                          onClick={() => navigate(`/problem/${prob.problem_id}`)}
                          className="text-sm font-medium text-accent hover:underline text-left"
                        >
                          {prob.problem_title || `Problem #${prob.problem_id}`}
                        </button>
                      ) : (
                        <p className="text-sm font-medium text-text-primary">Unlinked Problem</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {prob.solved ? (
                          <Badge variant="success">Solved</Badge>
                        ) : (
                          <Badge variant="danger">Upsolve</Badge>
                        )}
                        {prob.time_taken && (
                          <span className="text-xs text-text-muted">{prob.time_taken} mins</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contests</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Track your competitive programming contests and rating changes
          </p>
        </div>
      </div>

      {contests.length === 0 ? (
        <EmptyState
          icon={<Trophy size={24} />}
          title="No contests yet"
          description="You haven't added any contests to your history yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map((contest) => {
            const isPositive = contest.rating_change && contest.rating_change > 0;
            const isNegative = contest.rating_change && contest.rating_change < 0;

            return (
              <div
                key={contest.id}
                onClick={() => navigate(`/cp/contests/${contest.id}`)}
                className="bg-surface-1 border border-border rounded-xl p-5 cursor-pointer card-hover"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary truncate" title={contest.name}>
                      {contest.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">{contest.platform_name}</p>
                  </div>
                  {contest.rating_change !== null && (
                    <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
                      isPositive ? "bg-success-subtle text-success" : 
                      isNegative ? "bg-danger-subtle text-danger" : 
                      "bg-surface-2 text-text-secondary"
                    }`}>
                      {isPositive ? "+" : ""}{contest.rating_change}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {contest.contest_date || "Unknown"}
                  </span>
                  <span>{contest.problems.length} problems</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
