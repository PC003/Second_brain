// ============================================================
// PATTERNS PAGE — Second Brain
// Browse all DSA patterns grouped by category with stats
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, ChevronDown, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getPatternsWithStats } from "../services/patternService";
import type { PatternWithStats } from "../types";
import EmptyState from "../components/common/EmptyState";
import PatternProgress from "../components/patterns/PatternProgress";
import PatternModal from "../components/patterns/PatternModal";

export default function Patterns() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<PatternWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<PatternWithStats | null>(null);

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
      toast.error("Failed to load patterns.");
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
    return <LoadingSpinner label="Loading patterns..." />;
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">DSA Patterns</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              0 patterns across 0 categories
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPattern(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            Add Pattern
          </button>
        </div>
        <EmptyState
          icon={<Swords size={24} />}
          title="No patterns found"
          description="DSA patterns will appear here after database initialization or you can add your own."
        />
        {modalOpen && (
          <PatternModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            pattern={editingPattern}
            onSuccess={loadPatterns}
            existingGroups={groups}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">DSA Patterns</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {patterns.length} patterns across {groups.length} categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPattern(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Add Pattern
        </button>
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
                      className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border-subtle cursor-pointer card-hover group"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-text-primary">{pattern.name}</p>
                        {pattern.is_default === 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPattern(pattern);
                              setModalOpen(true);
                            }}
                            className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit pattern"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
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

      {modalOpen && (
        <PatternModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          pattern={editingPattern}
          onSuccess={loadPatterns}
          existingGroups={groups}
        />
      )}
    </div>
  );
}
