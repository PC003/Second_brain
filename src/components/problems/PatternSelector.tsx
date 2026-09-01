// ============================================================
// PATTERN SELECTOR — Second Brain
// Multi-select checkbox grid for DSA patterns, grouped by category
// Only shown when category = "dsa"
// ============================================================

import { useEffect, useState } from "react";
import { getAllPatterns } from "../../services/patternService";
import type { Pattern } from "../../types";
import { ChevronDown, Loader2 } from "lucide-react";

interface PatternSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function PatternSelector({ selectedIds, onChange }: PatternSelectorProps) {
  const [patterns, setPatterns] = useState<Record<string, Pattern[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPatterns();
  }, []);

  async function loadPatterns() {
    try {
      const all = await getAllPatterns();
      const grouped: Record<string, Pattern[]> = {};
      for (const p of all) {
        if (!grouped[p.group_name]) grouped[p.group_name] = [];
        grouped[p.group_name].push(p);
      }
      setPatterns(grouped);
      // Expand groups that have selected patterns
      const groupsWithSelected = new Set<string>();
      for (const p of all) {
        if (selectedIds.includes(p.id)) {
          groupsWithSelected.add(p.group_name);
        }
      }
      setExpandedGroups(groupsWithSelected);
    } catch (err) {
      console.error("Failed to load patterns:", err);
    } finally {
      setLoading(false);
    }
  }

  function togglePattern(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function toggleGroup(group: string) {
    const next = new Set(expandedGroups);
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    setExpandedGroups(next);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading patterns...
      </div>
    );
  }

  const groups = Object.keys(patterns);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Which DSA patterns does this problem use?
      </label>
      {selectedIds.length > 0 && (
        <p className="text-xs text-accent mb-2">{selectedIds.length} pattern{selectedIds.length > 1 ? "s" : ""} selected</p>
      )}
      <div className="border border-border rounded-xl overflow-hidden bg-surface-1">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group);
          const groupPatterns = patterns[group];
          const selectedInGroup = groupPatterns.filter((p) => selectedIds.includes(p.id)).length;

          return (
            <div key={group} className="border-b border-border-subtle last:border-b-0">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-surface-2 transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`text-text-muted transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                />
                <span className="font-medium text-text-primary flex-1">{group}</span>
                {selectedInGroup > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-subtle text-accent font-medium">
                    {selectedInGroup}
                  </span>
                )}
                <span className="text-xs text-text-muted">{groupPatterns.length}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-1">
                  {groupPatterns.map((pattern) => (
                    <label
                      key={pattern.id}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                        selectedIds.includes(pattern.id)
                          ? "bg-accent-subtle text-accent"
                          : "text-text-secondary hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(pattern.id)}
                        onChange={() => togglePattern(pattern.id)}
                        className="rounded border-border text-accent focus:ring-accent w-3.5 h-3.5"
                      />
                      <span className="truncate">{pattern.name}</span>
                    </label>
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
