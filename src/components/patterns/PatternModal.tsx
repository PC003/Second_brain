import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createPattern, updatePattern, deletePattern, getPatternUsageCount } from "../../services/patternService";
import type { Pattern } from "../../types";

interface PatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: Pattern | null;
  onSuccess: () => void;
  existingGroups: string[];
}

export default function PatternModal({
  isOpen,
  onClose,
  pattern,
  onSuccess,
  existingGroups
}: PatternModalProps) {
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (pattern) {
        setName(pattern.name);
        setGroupName(pattern.group_name);
      } else {
        setName("");
        setGroupName(existingGroups[0] || "");
      }
      setError("");
    }
  }, [isOpen, pattern, existingGroups]);

  if (!isOpen) return null;

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    e?.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Pattern name is required");
      return;
    }
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    setSaving(true);
    try {
      if (pattern) {
        await updatePattern(pattern.id, name.trim(), groupName.trim());
        toast.success("Pattern updated successfully");
      } else {
        await createPattern(name.trim(), groupName.trim(), false);
        toast.success("Pattern created successfully");
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
      if (count > 0) {
        if (!window.confirm(`This pattern is used by ${count} problems. Deleting it will remove the pattern from those problems. Are you sure?`)) {
          return;
        }
      } else {
        if (!window.confirm("Are you sure you want to delete this pattern?")) {
          return;
        }
      }

      setDeleting(true);
      await deletePattern(pattern.id);
      toast.success("Pattern deleted successfully");
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {pattern ? "Edit Pattern" : "Add Custom Pattern"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="bg-danger-subtle border border-danger/30 rounded-lg p-3 text-sm text-danger flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Pattern Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Two Pointers"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Category / Group
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Arrays, Strings, Trees..."
              list="pattern-groups-modal"
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <datalist id="pattern-groups-modal">
              {existingGroups.map(group => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </div>
        </form>

        <div className="px-5 py-4 border-t border-border bg-surface-2 flex items-center justify-between">
          <div>
            {pattern && pattern.is_default === 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-danger hover:bg-danger-subtle rounded-lg transition-colors"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
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
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
