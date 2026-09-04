// ============================================================
// PROBLEM FORM — Second Brain
// Shared form component for Add and Edit problem pages
// Multi-section: Basic Info → Patterns/Tags → Explanation → Code
// ============================================================

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, Link as LinkIcon } from "lucide-react";
import type { Category, Difficulty, ProblemFormData, ProblemStatus, Platform } from "../../types";
import { DEFAULT_PROBLEM_FORM } from "../../utils/constants";
import { validateProblemForm, isValidUrl } from "../../utils/validation";
import { getAllPlatforms } from "../../services/platformService";
import { checkDuplicateUrl } from "../../services/problemService";
import PatternSelector from "./PatternSelector";
import TagSelector from "./TagSelector";
import { MarkdownEditor } from "./MarkdownSection";
import { CodeEditorSection } from "./CodeSection";
import DrawingBoard from "./DrawingBoard";

interface ProblemFormProps {
  initialData?: Partial<ProblemFormData>;
  editingId?: number;
  onSubmit: (data: ProblemFormData) => Promise<void>;
  submitLabel?: string;
}

export default function ProblemForm({
  initialData,
  editingId,
  onSubmit,
  submitLabel = "Save Problem",
}: ProblemFormProps) {
  const [form, setForm] = useState<ProblemFormData>({
    ...DEFAULT_PROBLEM_FORM,
    ...initialData,
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicateUrl, setDuplicateUrl] = useState<{ id: number; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "patterns" | "explanation" | "rough_work" | "code">("basic");

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    try {
      const all = await getAllPlatforms();
      setPlatforms(all);
      // Auto-select first platform if none selected
      if (!form.platform_id && all.length > 0) {
        update("platform_id", all[0].id);
      }
    } catch (err) {
      console.error("Failed to load platforms:", err);
    }
  }

  function update<K extends keyof ProblemFormData>(key: K, value: ProblemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  }

  // Check for duplicate URL on blur
  async function handleUrlBlur() {
    if (!form.url.trim() || !isValidUrl(form.url)) {
      setDuplicateUrl(null);
      return;
    }
    try {
      const existing = await checkDuplicateUrl(form.url, editingId);
      if (existing) {
        setDuplicateUrl({ id: existing.id, title: existing.title });
      } else {
        setDuplicateUrl(null);
      }
    } catch {
      setDuplicateUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateProblemForm(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setActiveTab("basic");
      return;
    }

    if (duplicateUrl) {
      toast.error("This problem URL already exists.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save problem.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { key: "basic" as const, label: "Basic Info" },
    { key: "patterns" as const, label: form.category === "dsa" ? "Patterns" : "Tags" },
    { key: "explanation" as const, label: "Explanation" },
    { key: "rough_work" as const, label: "Rough Work" },
    { key: "code" as const, label: "Code" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-danger-subtle border border-danger/30 rounded-lg p-4 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-danger flex items-center gap-2">
              <AlertCircle size={14} />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Duplicate URL warning */}
      {duplicateUrl && (
        <div className="bg-warning-subtle border border-warning/30 rounded-lg p-4">
          <p className="text-sm text-warning flex items-center gap-2">
            <LinkIcon size={14} />
            This problem URL already exists: <strong>{duplicateUrl.title}</strong>
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-accent border-accent"
                : "text-text-muted border-transparent hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ BASIC INFO TAB ============ */}
      {activeTab === "basic" && (
        <div className="space-y-5 animate-fade-in">
          {/* Problem Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Problem Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g., Two Sum, Binary Search on Answer..."
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Problem URL */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Problem URL <span className="text-danger">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://leetcode.com/problems/..."
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Platform + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Platform <span className="text-danger">*</span>
              </label>
              <select
                value={form.platform_id}
                onChange={(e) => update("platform_id", Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value={0}>Select platform...</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Category <span className="text-danger">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as Category;
                  update("category", cat);
                  // Clear patterns/tags when switching category
                  if (cat === "dsa") update("tag_ids", []);
                  if (cat === "cp") update("pattern_ids", []);
                }}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="dsa">DSA</option>
                <option value="cp">Competitive Programming</option>
              </select>
            </div>
          </div>

          {/* Difficulty + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => update("difficulty", e.target.value as Difficulty)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as ProblemStatus)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
              >
                <option value="to_solve">To Solve</option>
                <option value="solved">Solved</option>
                <option value="need_revision">Need Revision</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ============ PATTERNS / TAGS TAB ============ */}
      {activeTab === "patterns" && (
        <div className="animate-fade-in">
          {form.category === "dsa" ? (
            <PatternSelector
              selectedIds={form.pattern_ids}
              onChange={(ids) => update("pattern_ids", ids)}
            />
          ) : (
            <TagSelector
              selectedIds={form.tag_ids}
              onChange={(ids) => update("tag_ids", ids)}
            />
          )}
        </div>
      )}

      {/* ============ EXPLANATION TAB ============ */}
      {activeTab === "explanation" && (
        <div className="space-y-6 animate-fade-in">
          <MarkdownEditor
            label="My Approach"
            value={form.approach}
            onChange={(v) => update("approach", v)}
            placeholder="How did you approach this problem?"
          />

          {/* TURNED OFF:
          <MarkdownEditor
            label="Key Observation"
            value={form.key_observation}
            onChange={(v) => update("key_observation", v)}
            placeholder="What was the key insight?"
            minHeight={150}
          />

          <MarkdownEditor
            label="Algorithm"
            value={form.algorithm}
            onChange={(v) => update("algorithm", v)}
            placeholder="Step-by-step algorithm..."
            minHeight={150}
          />

          <MarkdownEditor
            label="Why This Works"
            value={form.why_it_works}
            onChange={(v) => update("why_it_works", v)}
            placeholder="Why is this approach correct?"
            minHeight={120}
          />
          */}

          {/* Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Time Complexity</label>
              <input
                type="text"
                value={form.time_complexity}
                onChange={(e) => update("time_complexity", e.target.value)}
                placeholder="e.g., O(n log n)"
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Space Complexity</label>
              <input
                type="text"
                value={form.space_complexity}
                onChange={(e) => update("space_complexity", e.target.value)}
                placeholder="e.g., O(n)"
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface-2 text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <MarkdownEditor
            label="My Mistake"
            value={form.mistake}
            onChange={(v) => update("mistake", v)}
            placeholder="What mistake did you make?"
            minHeight={120}
          />

          <MarkdownEditor
            label="Things I Learned"
            value={form.lessons}
            onChange={(v) => update("lessons", v)}
            placeholder="What did you learn from this problem?"
            minHeight={120}
          />

          {/* TURNED OFF:
          <MarkdownEditor
            label="Additional Notes"
            value={form.notes}
            onChange={(v) => update("notes", v)}
            placeholder="Any other notes..."
            minHeight={120}
          />
          */}
        </div>
      )}

      {/* ============ ROUGH WORK TAB ============ */}
      {activeTab === "rough_work" && (
        <div className="animate-fade-in">
          <DrawingBoard
            value={form.rough_work}
            onChange={(v) => update("rough_work", v)}
          />
        </div>
      )}

      {/* ============ CODE TAB ============ */}
      {activeTab === "code" && (
        <div className="animate-fade-in">
          <CodeEditorSection
            code={form.code}
            language={form.code_language}
            onCodeChange={(v) => update("code", v)}
            onLanguageChange={(v) => update("code_language", v)}
          />
        </div>
      )}

      {/* ============ SUBMIT ============ */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
