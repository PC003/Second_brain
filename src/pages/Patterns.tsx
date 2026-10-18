// ============================================================
// PATTERNS PAGE — Second Brain
// Browse all DSA patterns grouped by category with stats
// Create/delete patterns and groups (custom and default)
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, ChevronDown, Plus, Edit2, Trash2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  getPatternsWithStats,
  deletePattern,
  deletePatternGroup,
  getPatternUsageCount,
} from "../services/patternService";
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
  const [modalInitialGroup, setModalInitialGroup] = useState<string | undefined>(undefined);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

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

  function handleOpenAddPattern(group?: string) {
    setEditingPattern(null);
    setModalInitialGroup(group);
    setIsAddingGroup(false);
    setModalOpen(true);
  }

  function handleOpenAddGroup() {
    setEditingPattern(null);
    setModalInitialGroup(undefined);
    setIsAddingGroup(true);
    setModalOpen(true);
  }

  async function handleDeletePattern(e: React.MouseEvent, pattern: PatternWithStats) {
    e.stopPropagation();
    try {
      const count = await getPatternUsageCount(pattern.id);
      const isDef = pattern.is_default === 1;
      const message = count > 0
        ? `This ${isDef ? "default " : ""}pattern is used by ${count} problem${count === 1 ? "" : "s"}. Deleting it will unlink it from those problems. Are you sure you want to delete "${pattern.name}"?`
        : `Are you sure you want to delete ${isDef ? "default " : ""}pattern "${pattern.name}"?`;

      if (!window.confirm(message)) {
        return;
      }

      await deletePattern(pattern.id);
      toast.success(`Pattern "${pattern.name}" deleted successfully.`);
      await loadPatterns();
    } catch (err) {
      console.error("Failed to delete pattern:", err);
      toast.error("Failed to delete pattern.");
    }
  }

  async function handleDeleteGroup(e: React.MouseEvent, group: string, patternCount: number) {
    e.stopPropagation();
    const message = `Are you sure you want to delete the entire group "${group}" and all its ${patternCount} pattern${patternCount === 1 ? "" : "s"}?\n\nProblems tagged with these patterns will not be deleted, but will have these pattern links removed.`;
    
    if (!window.confirm(message)) {
      return;
    }

    try {
      await deletePatternGroup(group);
      toast.success(`Group "${group}" and its patterns were deleted.`);
      await loadPatterns();
    } catch (err) {
      console.error("Failed to delete group:", err);
      toast.error("Failed to delete group.");
    }
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddGroup}
              className="flex items-center gap-2 px-3.5 py-2 bg-surface-2 border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-surface-3 transition-colors"
            >
              <FolderPlus size={16} />
              Add Group
            </button>
            <button
              onClick={() => handleOpenAddPattern()}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Pattern
            </button>
          </div>
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
            initialGroup={modalInitialGroup}
            isAddingGroup={isAddingGroup}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">DSA Patterns</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {patterns.length} patterns across {groups.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddGroup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-1 border border-border text-text-primary rounded-lg text-sm font-medium hover:bg-surface-2 hover:border-accent transition-colors shadow-sm"
            title="Create a new pattern category/group"
          >
            <FolderPlus size={16} className="text-accent" />
            Add Group
          </button>
          <button
            onClick={() => handleOpenAddPattern()}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Pattern
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const groupPatterns = grouped[group];
          const isExpanded = expandedGroups.has(group);
          const totalProblems = groupPatterns.reduce((s, p) => s + (p.problem_count || 0), 0);

          return (
            <div key={group} className="bg-surface-1 border border-border rounded-xl overflow-hidden shadow-xs">
              <div
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-surface-2 transition-colors cursor-pointer select-none"
              >
                <ChevronDown
                  size={16}
                  className={`text-text-muted transition-transform shrink-0 ${isExpanded ? "" : "-rotate-90"}`}
                />
                <span className="text-base font-semibold text-text-primary flex-1 truncate">{group}</span>
                <span className="text-xs text-text-muted mr-2">
                  {groupPatterns.length} pattern{groupPatterns.length === 1 ? "" : "s"} · {totalProblems} problem{totalProblems === 1 ? "" : "s"}
                </span>

                {/* Group Action Buttons */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenAddPattern(group)}
                    className="p-1.5 text-xs text-text-muted hover:text-accent hover:bg-surface-3 rounded-md transition-colors flex items-center gap-1 font-medium"
                    title={`Add new pattern to "${group}"`}
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">Add Pattern</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteGroup(e, group, groupPatterns.length)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-subtle rounded-md transition-colors"
                    title={`Delete group "${group}" and its ${groupPatterns.length} patterns`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {groupPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      onClick={() => navigate(`/dsa/patterns/${pattern.id}`)}
                      className="flex flex-col justify-between gap-2 px-4 py-3 rounded-lg border border-border-subtle bg-surface-2/40 hover:bg-surface-2 cursor-pointer card-hover group transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{pattern.name}</p>
                          {pattern.is_default === 1 && (
                            <span className="text-[10px] text-text-muted bg-surface-3 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Edit and Delete available for ALL patterns (custom + default) */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPattern(pattern);
                              setIsAddingGroup(false);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-text-muted hover:text-accent hover:bg-surface-3 rounded-md transition-colors"
                            title="Edit pattern"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeletePattern(e, pattern)}
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-subtle rounded-md transition-colors"
                            title="Delete pattern"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="w-full mt-2">
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
          initialGroup={modalInitialGroup}
          isAddingGroup={isAddingGroup}
        />
      )}
    </div>
  );
}
