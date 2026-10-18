// ============================================================
// CONSTANTS — Second Brain
// Application-wide constants and configuration
// ============================================================

import type { CodeLanguage, Difficulty, ProblemStatus } from "../types";

/** Status display configuration */
export const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  to_solve: {
    label: "To Solve",
    color: "text-info",
    bgColor: "bg-info-subtle",
    dotColor: "bg-info",
  },
  solved: {
    label: "Solved",
    color: "text-success",
    bgColor: "bg-success-subtle",
    dotColor: "bg-success",
  },
  need_revision: {
    label: "Need Revision",
    color: "text-warning",
    bgColor: "bg-warning-subtle",
    dotColor: "bg-warning",
  },
  mastered: {
    label: "Mastered",
    color: "text-accent",
    bgColor: "bg-accent-subtle",
    dotColor: "bg-accent",
  },
};

/** Difficulty display configuration */
export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  easy: { label: "Easy", color: "text-easy", bgColor: "bg-easy/10" },
  medium: { label: "Medium", color: "text-medium", bgColor: "bg-medium/10" },
  hard: { label: "Hard", color: "text-hard", bgColor: "bg-hard/10" },
};

/** Code language display names */
export const CODE_LANGUAGE_CONFIG: Record<CodeLanguage, { label: string; extension: string }> = {
  cpp: { label: "C++", extension: "cpp" },
  python: { label: "Python", extension: "py" },
  java: { label: "Java", extension: "java" },
  javascript: { label: "JavaScript", extension: "js" },
  other: { label: "Other", extension: "txt" },
};

/** Default empty form values */
export const DEFAULT_PROBLEM_FORM = {
  title: "",
  url: "",
  platform_id: 0,
  category: "dsa" as const,
  difficulty: "medium" as const,
  status: "to_solve" as const,
  approach: "",
  key_observation: "",
  algorithm: "",
  why_it_works: "",
  time_complexity: "",
  space_complexity: "",
  mistake: "",
  lessons: "",
  notes: "",
  rough_work: "",
  code: "",
  code_language: "cpp" as const,
  pattern_ids: [] as number[],
  tag_ids: [] as number[],
  next_review_date: null as string | null,
};

/** Database name */
export const DB_NAME = "sqlite:second_brain.db";

/** Platform detection for cross-platform shortcut labels (⌘ on macOS, Ctrl+ on Windows/Linux) */
export const IS_MAC =
  typeof navigator !== "undefined" &&
  Boolean(
    (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform === "macOS" ||
    /Mac|iPhone|iPod|iPad/.test(navigator.userAgent || navigator.platform || "")
  );

export const MOD_KEY = IS_MAC ? "⌘" : "Ctrl+";

/** Keyboard shortcuts (adaptive per OS) */
export const SHORTCUTS = {
  SEARCH: { key: "k", modifiers: [IS_MAC ? "meta" : "ctrl"] as const, label: `${MOD_KEY}K` },
  NEW_PROBLEM: { key: "n", modifiers: [IS_MAC ? "meta" : "ctrl"] as const, label: `${MOD_KEY}N` },
  SETTINGS: { key: ",", modifiers: [IS_MAC ? "meta" : "ctrl"] as const, label: `${MOD_KEY},` },
  TOGGLE_SIDEBAR: { key: "b", modifiers: [IS_MAC ? "meta" : "ctrl"] as const, label: `${MOD_KEY}B` },
  SAVE: { key: "s", modifiers: [IS_MAC ? "meta" : "ctrl"] as const, label: `${MOD_KEY}S` },
  ESCAPE: { key: "Escape", modifiers: [] as const, label: "Esc" },
} as const;

