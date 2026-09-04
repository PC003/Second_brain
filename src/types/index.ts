// ============================================================
// TYPES — Second Brain
// All TypeScript interfaces aligned with the database schema
// ============================================================

// ---- Enums ----

export type Category = "dsa" | "cp";

export type Difficulty = "easy" | "medium" | "hard";

export type ProblemStatus = "to_solve" | "solved" | "need_revision" | "mastered";

export type RevisionResult = "solved" | "needed_help" | "revealed";

export type PlatformType = "dsa" | "cp" | "both";

export type TagType = "cp" | "custom";

export type CodeLanguage = "cpp" | "python" | "java" | "javascript" | "other";

export type ThemeMode = "dark" | "light" | "system";

export type SortField =
  | "created_at"
  | "updated_at"
  | "title"
  | "difficulty"
  | "last_solved_at"
  | "next_review_date"
  | "platform";

export type SortOrder = "asc" | "desc";

// ---- Database Models ----

export interface Platform {
  id: number;
  name: string;
  type: PlatformType;
  created_at: string;
}

export interface Problem {
  id: number;
  title: string;
  url: string;
  platform_id: number;
  category: Category;
  difficulty: Difficulty;
  status: ProblemStatus;
  approach: string;
  key_observation: string;
  algorithm: string;
  why_it_works: string;
  time_complexity: string;
  space_complexity: string;
  mistake: string;
  lessons: string;
  notes: string;
  rough_work: string;
  code: string;
  code_language: CodeLanguage;
  last_solved_at: string | null;
  last_reviewed_at: string | null;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

/** Problem with joined data for display */
export interface ProblemWithRelations extends Problem {
  platform_name: string;
  patterns: Pattern[];
  tags: Tag[];
}

export interface Pattern {
  id: number;
  name: string;
  group_name: string;
  is_default: number; // SQLite boolean (0 or 1)
  created_at: string;
}

/** Pattern with problem count for the pattern browser */
export interface PatternWithStats extends Pattern {
  problem_count: number;
  solved_count: number;
  revision_count: number;
}

export interface ProblemPattern {
  problem_id: number;
  pattern_id: number;
}

export interface Tag {
  id: number;
  name: string;
  type: TagType;
  created_at: string;
}

export interface TagWithStats extends Tag {
  problem_count: number;
}

export interface ProblemTag {
  problem_id: number;
  tag_id: number;
}

export interface Contest {
  id: number;
  name: string;
  platform_id: number;
  url: string;
  contest_date: string;
  rating_before: number | null;
  rating_change: number | null;
  rating_after: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ContestWithRelations extends Contest {
  platform_name: string;
  problems: ContestProblemWithDetails[];
}

export interface ContestProblem {
  id: number;
  contest_id: number;
  problem_id: number | null;
  problem_label: string;
  solved: number; // SQLite boolean
  time_taken: number | null;
  notes: string;
}

export interface ContestProblemWithDetails extends ContestProblem {
  problem_title?: string;
  problem_url?: string;
}

export interface RevisionHistory {
  id: number;
  problem_id: number;
  reviewed_at: string;
  result: RevisionResult;
  notes: string;
}

// ---- Form Data ----

export interface ProblemFormData {
  title: string;
  url: string;
  platform_id: number;
  category: Category;
  difficulty: Difficulty;
  status: ProblemStatus;
  approach: string;
  key_observation: string;
  algorithm: string;
  why_it_works: string;
  time_complexity: string;
  space_complexity: string;
  mistake: string;
  lessons: string;
  notes: string;
  rough_work: string;
  code: string;
  code_language: CodeLanguage;
  pattern_ids: number[];
  tag_ids: number[];
  next_review_date: string | null;
}

export interface ContestFormData {
  name: string;
  platform_id: number;
  url: string;
  contest_date: string;
  rating_before: number | null;
  rating_change: number | null;
  rating_after: number | null;
  notes: string;
  problems: ContestProblemFormData[];
}

export interface ContestProblemFormData {
  problem_id: number | null;
  problem_label: string;
  solved: boolean;
  time_taken: number | null;
  notes: string;
}

// ---- Filters ----

export interface ProblemFilters {
  search: string;
  platform_id: number | null;
  category: Category | null;
  difficulty: Difficulty | null;
  status: ProblemStatus | null;
  pattern_id: number | null;
  tag_id: number | null;
  sort_by: SortField;
  sort_order: SortOrder;
}

// ---- Dashboard ----

export interface DashboardStats {
  total: number;
  solved: number;
  to_solve: number;
  need_revision: number;
  mastered: number;
}

export interface DsaStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface CpStats {
  total: number;
  codeforces: number;
  codechef: number;
  atcoder: number;
  other: number;
}

export interface PatternOverview {
  id: number;
  name: string;
  count: number;
}

// ---- Analytics ----

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface PlatformDistribution {
  platform: string;
  count: number;
}

export interface DifficultyDistribution {
  difficulty: Difficulty;
  count: number;
}

// ---- Revision Schedule Options ----

export type RevisionInterval =
  | "tomorrow"
  | "3_days"
  | "7_days"
  | "14_days"
  | "30_days"
  | "custom"
  | "none";

export interface RevisionScheduleOption {
  label: string;
  value: RevisionInterval;
  days?: number;
}

export const REVISION_SCHEDULE_OPTIONS: RevisionScheduleOption[] = [
  { label: "Review tomorrow", value: "tomorrow", days: 1 },
  { label: "Review in 3 days", value: "3_days", days: 3 },
  { label: "Review in 7 days", value: "7_days", days: 7 },
  { label: "Review in 14 days", value: "14_days", days: 14 },
  { label: "Review in 30 days", value: "30_days", days: 30 },
  { label: "Custom date", value: "custom" },
  { label: "No scheduled review", value: "none" },
];
