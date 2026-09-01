// ============================================================
// TAG SELECTOR — Second Brain
// Multi-select for CP tags with option to create new tags inline
// Only shown when category = "cp"
// ============================================================

import { useEffect, useState } from "react";
import { getAllTags, createTag } from "../../services/tagService";
import type { Tag } from "../../types";
import { Loader2, Plus, X } from "lucide-react";

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      const all = await getAllTags();
      setTags(all);
    } catch (err) {
      console.error("Failed to load tags:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(id: number) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((tid) => tid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  async function handleAddTag() {
    const name = newTagName.trim();
    if (!name) return;

    // Check if tag already exists
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onChange([...selectedIds, existing.id]);
      }
      setNewTagName("");
      return;
    }

    setAdding(true);
    try {
      const id = await createTag(name, "cp");
      await loadTags();
      onChange([...selectedIds, id]);
      setNewTagName("");
    } catch (err) {
      console.error("Failed to create tag:", err);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading tags...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-secondary">
        CP Tags
      </label>

      {/* Selected tags */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent-subtle text-accent text-xs font-medium"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => toggleTag(id)}
                  className="hover:text-danger transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Tag grid */}
      <div className="flex flex-wrap gap-1.5">
        {tags
          .filter((t) => !selectedIds.includes(t.id))
          .map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="px-2.5 py-1 rounded-md border border-border text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              {tag.name}
            </button>
          ))}
      </div>

      {/* Add new tag */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
          placeholder="Add custom tag..."
          className="flex-1 h-8 px-3 rounded-md border border-border bg-surface-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={!newTagName.trim() || adding}
          className="h-8 px-3 rounded-md bg-surface-2 border border-border text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
        >
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>
    </div>
  );
}
