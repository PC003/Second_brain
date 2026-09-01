// ============================================================
// PATTERNS PAGE — Second Brain
// Browse all DSA patterns grouped by category with stats
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Loader2, ChevronDown } from "lucide-react";
import { getPatternsWithStats } from "../services/patternService";
import type { PatternWithStats } from "../types";
import EmptyState from "../components/common/EmptyState";
import PatternProgress from "../components/patterns/PatternProgress";

export default function Patterns() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<PatternWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPatterns();
  }, []);

  async function loadPatterns() {
    try {
      const all = await getPatternsWithStats();
      setPatterns(all);
      // Expand all groups by default
      const groups = new Set(all.map((p) => p.group_name));
      setExpandedGroups(groups);
    } catch (err) {
      console.error("Failed to load patterns:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleGroup(group: string) {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setExpandedGroups(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    );
  }

  // Group patterns
  const grouped: Record<string, PatternWithStats[]> = {};
  for (const p of patterns) {
    if (!grouped[p.group_name]) grouped[p.group_name] = [];
    grouped[p.group_name].push(p);
  }

  const groups = Object.keys(grouped);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<Swords size={24} />}
        title="No patterns found"
        description="DSA patterns will appear here after database initialization."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">DSA Patterns</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {patterns.length} patterns across {groups.length} categories
        </p>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const groupPatterns = grouped[group];
          const isExpanded = expandedGroups.has(group);
          const totalProblems = groupPatterns.reduce((s, p) => s + (p.problem_count || 0), 0);

          return (
            <div key={group} className="bg-surface-1 border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-surface-2 transition-colors"
              >
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                />
                <span className="text-base font-semibold text-text-primary flex-1">{group}</span>
                <span className="text-xs text-text-muted">
                  {groupPatterns.length} patterns · {totalProblems} problems
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groupPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      onClick={() => navigate(`/dsa/patterns/${pattern.id}`)}
                      className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border-subtle cursor-pointer card-hover"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{pattern.name}</p>
                      </div>
                      <div className="w-full mt-3">
                        <PatternProgress 
                          total={pattern.problem_count || 0}
                          solved={pattern.solved_count || 0}
                          needsRevision={pattern.revision_count || 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
