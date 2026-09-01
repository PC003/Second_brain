// ============================================================
// ANALYTICS SERVICE — Second Brain
// Dashboard stats and chart data queries
// ============================================================

import { select } from "./database";
import type {
  DashboardStats,
  DsaStats,
  CpStats,
  PatternOverview,
  TimeSeriesPoint,
  PlatformDistribution,
  DifficultyDistribution,
} from "../types";

/** Overall problem stats */
export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await select<DashboardStats>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved,
      SUM(CASE WHEN status = 'to_solve' THEN 1 ELSE 0 END) as to_solve,
      SUM(CASE WHEN status = 'need_revision' THEN 1 ELSE 0 END) as need_revision,
      SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered
    FROM problems
  `);
  return rows[0] || { total: 0, solved: 0, to_solve: 0, need_revision: 0, mastered: 0 };
}

/** DSA-specific stats */
export async function getDsaStats(): Promise<DsaStats> {
  const rows = await select<DsaStats>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as easy,
      SUM(CASE WHEN difficulty = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as hard
    FROM problems WHERE category = 'dsa'
  `);
  return rows[0] || { total: 0, easy: 0, medium: 0, hard: 0 };
}

/** CP-specific stats */
export async function getCpStats(): Promise<CpStats> {
  const rows = await select<CpStats>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN pl.name = 'Codeforces' THEN 1 ELSE 0 END) as codeforces,
      SUM(CASE WHEN pl.name = 'CodeChef' THEN 1 ELSE 0 END) as codechef,
      SUM(CASE WHEN pl.name = 'AtCoder' THEN 1 ELSE 0 END) as atcoder,
      SUM(CASE WHEN pl.name NOT IN ('Codeforces','CodeChef','AtCoder') THEN 1 ELSE 0 END) as other
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
    WHERE p.category = 'cp'
  `);
  return rows[0] || { total: 0, codeforces: 0, codechef: 0, atcoder: 0, other: 0 };
}

/** Top patterns by problem count */
export async function getPatternOverview(limit: number = 10): Promise<PatternOverview[]> {
  return select<PatternOverview>(`
    SELECT p.id, p.name, COUNT(pp.problem_id) as count
    FROM patterns p
    INNER JOIN problem_patterns pp ON p.id = pp.pattern_id
    GROUP BY p.id
    ORDER BY count DESC
    LIMIT $1
  `, [limit]);
}

/** Problems solved over time (grouped by date) */
export async function getProblemsOverTime(): Promise<TimeSeriesPoint[]> {
  return select<TimeSeriesPoint>(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM problems
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);
}

/** Platform distribution */
export async function getPlatformDistribution(): Promise<PlatformDistribution[]> {
  return select<PlatformDistribution>(`
    SELECT pl.name as platform, COUNT(*) as count
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
    GROUP BY pl.name
    ORDER BY count DESC
  `);
}

/** Difficulty distribution */
export async function getDifficultyDistribution(): Promise<DifficultyDistribution[]> {
  return select<DifficultyDistribution>(`
    SELECT difficulty, COUNT(*) as count
    FROM problems
    GROUP BY difficulty
    ORDER BY CASE difficulty WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 END
  `);
}
