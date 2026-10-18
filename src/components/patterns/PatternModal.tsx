import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, AlertCircle, Plus, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { createPattern, updatePattern, deletePattern, getPatternUsageCount } from "../../services/patternService";
import type { Pattern } from "../../types";

interface PatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: Pattern | null;
  onSuccess: () => void;
  existingGroups: string[];
  initialGroup?: string;
  isAddingGroup?: boolean;
}

export default function PatternModal({
  isOpen,
  onClose,
  pattern,
  onSuccess,
  existingGroups,
  initialGroup,
  isAddingGroup = false,
}: PatternModalProps) {
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isNewGroup, setIsNewGroup] = useState(isAddingGroup);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (pattern) {
        setName(pattern.name);
        setGroupName(pattern.group_name);
        setIsNewGroup(false);
      } else if (isAddingGroup) {
        setName("");
        setGroupName("");
        setIsNewGroup(true);
      } else {
        setName("");
        setGroupName(initialGroup || existingGroups[0] || "");
        setIsNewGroup(!existingGroups.length);
      }
      setError("");
    }
  }, [isOpen, pattern, existingGroups, initialGroup, isAddingGroup]);

  if (!isOpen) return null;

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedGroup = groupName.trim();

    if (!trimmedGroup) {
      setError("Group / Category name is required");
      return;
    }

    if (!trimmedName) {
      setError("Pattern name is required");
      return;
    }

    setSaving(true);
    try {
      if (pattern) {
        await updatePattern(pattern.id, trimmedName, trimmedGroup);
        toast.success(`Pattern "${trimmedName}" updated successfully`);
      } else {
        await createPattern(trimmedName, trimmedGroup, false);
        toast.success(
          isAddingGroup
            ? `Group "${trimmedGroup}" with pattern "${trimmedName}" created`
            : `Pattern "${trimmedName}" created successfully`
        );
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save pattern");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pattern) return;

    try {
      const count = await getPatternUsageCount(pattern.id);
      const isDef = pattern.is_default === 1;
      const confirmPrompt = count > 0
        ? `This ${isDef ? "default " : ""}pattern is used by ${count} problem${count === 1 ? "" : "s"}. Deleting it will remove the pattern association from those problems. Are you sure you want to delete "${pattern.name}"?`
        : `Are you sure you want to delete this ${isDef ? "default " : ""}pattern "${pattern.name}"?`;

      if (!window.confirm(confirmPrompt)) {
        return;
      }

      setDeleting(true);
      await deletePattern(pattern.id);
      toast.success(`Pattern "${pattern.name}" deleted successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete pattern");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div 
        className="w-full max-w-md bg-surface-1 border border-border rounded-xl shadow-xl overflow-hidden flex flex-col shrink-0 min-w-[320px] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {isAddingGroup ? (
              <FolderPlus size={18} className="text-accent" />
            ) : (
              <Plus size={18} className="text-accent" />
            )}
            <h2 className="text-lg font-semibold text-text-primary">
              {pattern
                ? `Edit Pattern${pattern.is_default ? " (Default)" : ""}`
                : isAddingGroup
                ? "Add New Pattern Group"
                : "Add DSA Pattern"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-danger-subtle border border-danger/30 rounded-lg p-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Group / Category Selection & Creation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-text-secondary">
                Group / Category
              </label>
              {!pattern && existingGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewGroup(!isNewGroup);
                    setGroupName(isNewGroup ? existingGroups[0] : "");
                  }}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  {isNewGroup ? "Choose Existing Group" : "+ Add New Group"}
                </button>
              )}
            </div>

            {isNewGroup || existingGroups.length === 0 ? (
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Dynamic Programming, Graphs, Trie..."
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                autoFocus={isAddingGroup}
              />
            ) : (
              <select
                value={groupName}
                onChange={(e) => {
                  if (e.target.value === "__NEW_GROUP__") {
                    setIsNewGroup(true);
                    setGroupName("");
                  } else {
                    setGroupName(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                {existingGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
                <option value="__NEW_GROUP__">+ Add New Group...</option>
              </select>
            )}
          </div>

          {/* Pattern Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              {isAddingGroup ? "First Pattern Name" : "Pattern Name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAddingGroup ? "e.g., Standard Trie / Prefix Tree" : "e.g., Two Pointers, Sliding Window"}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus={!isAddingGroup}
            />
            {isAddingGroup && (
              <p className="text-xs text-text-muted">
                Every pattern group contains one or more patterns. You can add more patterns to this group anytime.
              </p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-border bg-surface-2 flex items-center justify-between">
          <div>
            {pattern && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-danger hover:bg-danger-subtle rounded-lg transition-colors disabled:opacity-50"
                title="Delete this pattern"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete Pattern
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {pattern ? "Save Changes" : isAddingGroup ? "Create Group" : "Add Pattern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
