// ============================================================
// PATTERN SERVICE — Second Brain
// CRUD + statistics for DSA patterns
// ============================================================

import { execute, select } from "./database";
import type { Pattern, PatternWithStats } from "../types";

/** Get all patterns ordered by group then name */
export async function getAllPatterns(): Promise<Pattern[]> {
  return select<Pattern>("SELECT * FROM patterns ORDER BY group_name, name");
}

/** Get all patterns with problem counts */
export async function getPatternsWithStats(): Promise<PatternWithStats[]> {
  return select<PatternWithStats>(`
    SELECT
      p.*,
      COUNT(pp.problem_id) as problem_count,
      SUM(CASE WHEN pr.status = 'solved' OR pr.status = 'mastered' THEN 1 ELSE 0 END) as solved_count,
      SUM(CASE WHEN pr.status = 'need_revision' THEN 1 ELSE 0 END) as revision_count
    FROM patterns p
    LEFT JOIN problem_patterns pp ON p.id = pp.pattern_id
    LEFT JOIN problems pr ON pp.problem_id = pr.id
    GROUP BY p.id
    ORDER BY p.group_name, p.name
  `);
}

/** Get patterns grouped by group_name */
export async function getPatternsGrouped(): Promise<Record<string, Pattern[]>> {
  const patterns = await getAllPatterns();
  const grouped: Record<string, Pattern[]> = {};
  for (const pattern of patterns) {
    if (!grouped[pattern.group_name]) {
      grouped[pattern.group_name] = [];
    }
    grouped[pattern.group_name].push(pattern);
  }
  return grouped;
}

/** Get a single pattern by ID */
export async function getPatternById(id: number): Promise<Pattern | null> {
  const rows = await select<Pattern>("SELECT * FROM patterns WHERE id = $1", [id]);
  return rows[0] || null;
}

/** Create a new pattern */
export async function createPattern(
  name: string,
  groupName: string,
  isDefault: boolean = false
): Promise<number> {
  const result = await execute(
    "INSERT INTO patterns (name, group_name, is_default) VALUES ($1, $2, $3)",
    [name, groupName, isDefault ? 1 : 0]
  );
  return result.lastInsertId;
}

/** Update a pattern */
export async function updatePattern(
  id: number,
  name: string,
  groupName: string
): Promise<void> {
  await execute(
    "UPDATE patterns SET name = $1, group_name = $2 WHERE id = $3",
    [name, groupName, id]
  );
}

/** Delete a pattern */
export async function deletePattern(id: number): Promise<void> {
  // CASCADE will remove problem_patterns entries automatically
  await execute("DELETE FROM patterns WHERE id = $1", [id]);
}

/** Check how many problems use this pattern */
export async function getPatternUsageCount(id: number): Promise<number> {
  const rows = await select<{ count: number }>(
    "SELECT COUNT(*) as count FROM problem_patterns WHERE pattern_id = $1",
    [id]
  );
  return rows[0].count;
}

/** Get pattern IDs for a problem */
export async function getPatternIdsForProblem(problemId: number): Promise<number[]> {
  const rows = await select<{ pattern_id: number }>(
    "SELECT pattern_id FROM problem_patterns WHERE problem_id = $1",
    [problemId]
  );
  return rows.map((r) => r.pattern_id);
}

/** Get patterns for a problem */
export async function getPatternsForProblem(problemId: number): Promise<Pattern[]> {
  return select<Pattern>(`
    SELECT p.* FROM patterns p
    INNER JOIN problem_patterns pp ON p.id = pp.pattern_id
    WHERE pp.problem_id = $1
    ORDER BY p.group_name, p.name
  `, [problemId]);
}
