// ============================================================
// REVISION SERVICE — Second Brain
// Revision scheduling, history, and due problem queries
// ============================================================

import { execute, select } from "./database";
import type { Problem, ProblemWithRelations, RevisionHistory } from "../types";
import { getPatternsForProblem } from "./patternService";
import { getTagsForProblem } from "./tagService";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function now(): string {
  return new Date().toISOString();
}

/** Get problems due for revision today or overdue */
export async function getDueProblems(): Promise<ProblemWithRelations[]> {
  const rows = await select<Problem & { platform_name: string }>(`
    SELECT p.*, pl.name as platform_name
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
    WHERE p.next_review_date IS NOT NULL
      AND p.next_review_date <= $1
      AND p.status != 'mastered'
    ORDER BY p.next_review_date ASC
  `, [today()]);

  const problems: ProblemWithRelations[] = [];
  for (const row of rows) {
    const patterns = await getPatternsForProblem(row.id);
    const tags = await getTagsForProblem(row.id);
    problems.push({ ...row, patterns, tags });
  }
  return problems;
}

/** Get upcoming revision problems (future dates) */
export async function getUpcomingProblems(): Promise<ProblemWithRelations[]> {
  const rows = await select<Problem & { platform_name: string }>(`
    SELECT p.*, pl.name as platform_name
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
    WHERE p.next_review_date IS NOT NULL
      AND p.next_review_date > $1
    ORDER BY p.next_review_date ASC
  `, [today()]);

  const problems: ProblemWithRelations[] = [];
  for (const row of rows) {
    const patterns = await getPatternsForProblem(row.id);
    const tags = await getTagsForProblem(row.id);
    problems.push({ ...row, patterns, tags });
  }
  return problems;
}

/** Complete a revision session */
export async function completeRevision(
  problemId: number,
  result: "solved" | "needed_help" | "revealed",
  notes: string = "",
  nextReviewDate: string | null = null
): Promise<void> {
  // Record in revision history
  await execute(
    `INSERT INTO revision_history (problem_id, reviewed_at, result, notes)
     VALUES ($1, $2, $3, $4)`,
    [problemId, now(), result, notes]
  );

  // Update problem's review timestamps
  await execute(
    `UPDATE problems SET
      last_reviewed_at = $1,
      next_review_date = $2,
      status = CASE WHEN $3 = 'solved' THEN 'solved' ELSE status END,
      last_solved_at = CASE WHEN $3 = 'solved' THEN $1 ELSE last_solved_at END,
      updated_at = $1
    WHERE id = $4`,
    [now(), nextReviewDate, result, problemId]
  );
}

/** Get revision history for a problem */
export async function getRevisionHistory(problemId: number): Promise<RevisionHistory[]> {
  return select<RevisionHistory>(
    `SELECT * FROM revision_history
     WHERE problem_id = $1
     ORDER BY reviewed_at DESC`,
    [problemId]
  );
}

/** Calculate next review date from an interval */
export function calculateNextReviewDate(interval: string): string | null {
  const daysMap: Record<string, number> = {
    tomorrow: 1,
    "3_days": 3,
    "7_days": 7,
    "14_days": 14,
    "30_days": 30,
  };

  const days = daysMap[interval];
  if (!days) return null;

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
