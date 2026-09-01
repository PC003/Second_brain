// ============================================================
// CONTEST SERVICE — Second Brain
// CRUD for contests and contest-problem relationships
// ============================================================

import { execute, select } from "./database";
import type {
  Contest,
  ContestWithRelations,
  ContestFormData,
  ContestProblem,
  ContestProblemWithDetails,
} from "../types";

function now(): string {
  return new Date().toISOString();
}

/** Get all contests */
export async function getAllContests(): Promise<ContestWithRelations[]> {
  const rows = await select<Contest & { platform_name: string }>(`
    SELECT c.*, pl.name as platform_name
    FROM contests c
    INNER JOIN platforms pl ON c.platform_id = pl.id
    ORDER BY c.contest_date DESC
  `);

  const contests: ContestWithRelations[] = [];
  for (const row of rows) {
    const problems = await getContestProblems(row.id);
    contests.push({ ...row, problems });
  }
  return contests;
}

/** Get a single contest by ID */
export async function getContestById(id: number): Promise<ContestWithRelations | null> {
  const rows = await select<Contest & { platform_name: string }>(`
    SELECT c.*, pl.name as platform_name
    FROM contests c
    INNER JOIN platforms pl ON c.platform_id = pl.id
    WHERE c.id = $1
  `, [id]);

  if (rows.length === 0) return null;

  const problems = await getContestProblems(id);
  return { ...rows[0], problems };
}

/** Get contest problems */
export async function getContestProblems(contestId: number): Promise<ContestProblemWithDetails[]> {
  return select<ContestProblemWithDetails>(`
    SELECT cp.*, p.title as problem_title, p.url as problem_url
    FROM contest_problems cp
    LEFT JOIN problems p ON cp.problem_id = p.id
    WHERE cp.contest_id = $1
    ORDER BY cp.problem_label ASC
  `, [contestId]);
}

/** Create a new contest */
export async function createContest(data: ContestFormData): Promise<number> {
  const result = await execute(
    `INSERT INTO contests (name, platform_id, url, contest_date, rating_before, rating_change, rating_after, notes, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [data.name, data.platform_id, data.url, data.contest_date, data.rating_before, data.rating_change, data.rating_after, data.notes, now(), now()]
  );
  const contestId = result.lastInsertId;

  for (const prob of data.problems) {
    await execute(
      `INSERT INTO contest_problems (contest_id, problem_id, problem_label, solved, time_taken, notes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [contestId, prob.problem_id, prob.problem_label, prob.solved ? 1 : 0, prob.time_taken, prob.notes]
    );
  }

  return contestId;
}

/** Update a contest */
export async function updateContest(id: number, data: ContestFormData): Promise<void> {
  await execute(
    `UPDATE contests SET name=$1, platform_id=$2, url=$3, contest_date=$4, rating_before=$5, rating_change=$6, rating_after=$7, notes=$8, updated_at=$9 WHERE id=$10`,
    [data.name, data.platform_id, data.url, data.contest_date, data.rating_before, data.rating_change, data.rating_after, data.notes, now(), id]
  );

  await execute("DELETE FROM contest_problems WHERE contest_id = $1", [id]);
  for (const prob of data.problems) {
    await execute(
      `INSERT INTO contest_problems (contest_id, problem_id, problem_label, solved, time_taken, notes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, prob.problem_id, prob.problem_label, prob.solved ? 1 : 0, prob.time_taken, prob.notes]
    );
  }
}

/** Delete a contest */
export async function deleteContest(id: number): Promise<void> {
  await execute("DELETE FROM contests WHERE id = $1", [id]);
}
