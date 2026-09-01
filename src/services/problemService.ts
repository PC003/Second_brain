// ============================================================
// PROBLEM SERVICE — Second Brain
// Full CRUD, search, filtering, sorting for problems
// ============================================================

import { execute, select } from "./database";
import type {
  Problem,
  ProblemWithRelations,
  ProblemFormData,
  ProblemFilters,
} from "../types";
import { getPatternsForProblem } from "./patternService";
import { getTagsForProblem } from "./tagService";

// ---- Helpers ----

function now(): string {
  return new Date().toISOString();
}

// ---- Create ----

/** Create a new problem with patterns and tags */
export async function createProblem(data: ProblemFormData): Promise<number> {
  const result = await execute(
    `INSERT INTO problems (
      title, url, platform_id, category, difficulty, status,
      approach, key_observation, algorithm, why_it_works,
      time_complexity, space_complexity, mistake, lessons, notes,
      code, code_language, next_review_date, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
    [
      data.title,
      data.url,
      data.platform_id,
      data.category,
      data.difficulty,
      data.status,
      data.approach,
      data.key_observation,
      data.algorithm,
      data.why_it_works,
      data.time_complexity,
      data.space_complexity,
      data.mistake,
      data.lessons,
      data.notes,
      data.code,
      data.code_language,
      data.next_review_date,
      now(),
      now(),
    ]
  );

  const problemId = result.lastInsertId;

  // Assign patterns
  if (data.pattern_ids.length > 0) {
    for (const patternId of data.pattern_ids) {
      await execute(
        "INSERT INTO problem_patterns (problem_id, pattern_id) VALUES ($1, $2)",
        [problemId, patternId]
      );
    }
  }

  // Assign tags
  if (data.tag_ids.length > 0) {
    for (const tagId of data.tag_ids) {
      await execute(
        "INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2)",
        [problemId, tagId]
      );
    }
  }

  return problemId;
}

// ---- Read ----

/** Get a single problem by ID with patterns and tags */
export async function getProblemById(id: number): Promise<ProblemWithRelations | null> {
  const rows = await select<Problem & { platform_name: string }>(`
    SELECT p.*, pl.name as platform_name
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
    WHERE p.id = $1
  `, [id]);

  if (rows.length === 0) return null;

  const problem = rows[0];
  const patterns = await getPatternsForProblem(id);
  const tags = await getTagsForProblem(id);

  return { ...problem, patterns, tags };
}

/** Check if a URL already exists (for duplicate detection) */
export async function checkDuplicateUrl(url: string, excludeId?: number): Promise<Problem | null> {
  let query = "SELECT * FROM problems WHERE url = $1";
  const params: unknown[] = [url];

  if (excludeId) {
    query += " AND id != $2";
    params.push(excludeId);
  }

  const rows = await select<Problem>(query, params);
  return rows[0] || null;
}

/** Get problems with filtering, sorting, and search */
export async function getProblems(filters: Partial<ProblemFilters> = {}): Promise<ProblemWithRelations[]> {
  let query = `
    SELECT DISTINCT p.*, pl.name as platform_name
    FROM problems p
    INNER JOIN platforms pl ON p.platform_id = pl.id
  `;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  // Pattern filter — requires JOIN
  if (filters.pattern_id) {
    query += ` INNER JOIN problem_patterns pp ON p.id = pp.problem_id`;
    conditions.push(`pp.pattern_id = $${paramIndex}`);
    params.push(filters.pattern_id);
    paramIndex++;
  }

  // Tag filter — requires JOIN
  if (filters.tag_id) {
    query += ` INNER JOIN problem_tags pt ON p.id = pt.problem_id`;
    conditions.push(`pt.tag_id = $${paramIndex}`);
    params.push(filters.tag_id);
    paramIndex++;
  }

  // Platform filter
  if (filters.platform_id) {
    conditions.push(`p.platform_id = $${paramIndex}`);
    params.push(filters.platform_id);
    paramIndex++;
  }

  // Category filter
  if (filters.category) {
    conditions.push(`p.category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  // Difficulty filter
  if (filters.difficulty) {
    conditions.push(`p.difficulty = $${paramIndex}`);
    params.push(filters.difficulty);
    paramIndex++;
  }

  // Status filter
  if (filters.status) {
    conditions.push(`p.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  // Full-text search
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    // Use FTS5 for full-text search, falling back to LIKE for pattern/tag names
    conditions.push(`(
      p.id IN (SELECT rowid FROM problems_fts WHERE problems_fts MATCH $${paramIndex})
      OR p.id IN (
        SELECT pp2.problem_id FROM problem_patterns pp2
        INNER JOIN patterns pat ON pp2.pattern_id = pat.id
        WHERE pat.name LIKE $${paramIndex + 1}
      )
      OR p.id IN (
        SELECT pt2.problem_id FROM problem_tags pt2
        INNER JOIN tags t ON pt2.tag_id = t.id
        WHERE t.name LIKE $${paramIndex + 1}
      )
    )`);
    params.push(searchTerm);
    params.push(`%${searchTerm}%`);
    paramIndex += 2;
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sorting
  const sortField = filters.sort_by || "updated_at";
  const sortOrder = filters.sort_order || "desc";
  const validSortFields: Record<string, string> = {
    created_at: "p.created_at",
    updated_at: "p.updated_at",
    title: "p.title",
    difficulty: "p.difficulty",
    last_solved_at: "p.last_solved_at",
    next_review_date: "p.next_review_date",
    platform: "pl.name",
  };
  const sqlSortField = validSortFields[sortField] || "p.updated_at";
  const sqlSortOrder = sortOrder === "asc" ? "ASC" : "DESC";
  query += ` ORDER BY ${sqlSortField} ${sqlSortOrder}`;

  const rows = await select<Problem & { platform_name: string }>(query, params);

  // Hydrate with patterns and tags
  const problems: ProblemWithRelations[] = [];
  for (const row of rows) {
    const patterns = await getPatternsForProblem(row.id);
    const tags = await getTagsForProblem(row.id);
    problems.push({ ...row, patterns, tags });
  }

  return problems;
}

/** Get recently updated problems (for dashboard) */
export async function getRecentProblems(): Promise<ProblemWithRelations[]> {
  return getProblems({ sort_by: "updated_at", sort_order: "desc" });
}

// ---- Update ----

/** Update a problem */
export async function updateProblem(id: number, data: ProblemFormData): Promise<void> {
  await execute(
    `UPDATE problems SET
      title=$1, url=$2, platform_id=$3, category=$4, difficulty=$5, status=$6,
      approach=$7, key_observation=$8, algorithm=$9, why_it_works=$10,
      time_complexity=$11, space_complexity=$12, mistake=$13, lessons=$14, notes=$15,
      code=$16, code_language=$17, next_review_date=$18, updated_at=$19
    WHERE id=$20`,
    [
      data.title,
      data.url,
      data.platform_id,
      data.category,
      data.difficulty,
      data.status,
      data.approach,
      data.key_observation,
      data.algorithm,
      data.why_it_works,
      data.time_complexity,
      data.space_complexity,
      data.mistake,
      data.lessons,
      data.notes,
      data.code,
      data.code_language,
      data.next_review_date,
      now(),
      id,
    ]
  );

  // Re-assign patterns
  await execute("DELETE FROM problem_patterns WHERE problem_id = $1", [id]);
  for (const patternId of data.pattern_ids) {
    await execute(
      "INSERT INTO problem_patterns (problem_id, pattern_id) VALUES ($1, $2)",
      [id, patternId]
    );
  }

  // Re-assign tags
  await execute("DELETE FROM problem_tags WHERE problem_id = $1", [id]);
  for (const tagId of data.tag_ids) {
    await execute(
      "INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2)",
      [id, tagId]
    );
  }
}

/** Update just the status of a problem */
export async function updateProblemStatus(
  id: number,
  status: string,
  lastSolvedAt?: string | null
): Promise<void> {
  if (lastSolvedAt) {
    await execute(
      "UPDATE problems SET status=$1, last_solved_at=$2, updated_at=$3 WHERE id=$4",
      [status, lastSolvedAt, now(), id]
    );
  } else {
    await execute(
      "UPDATE problems SET status=$1, updated_at=$2 WHERE id=$3",
      [status, now(), id]
    );
  }
}

/** Schedule a review date */
export async function scheduleReview(id: number, nextReviewDate: string | null): Promise<void> {
  await execute(
    "UPDATE problems SET next_review_date=$1, updated_at=$2 WHERE id=$3",
    [nextReviewDate, now(), id]
  );
}

// ---- Delete ----

/** Delete a problem (CASCADE will clean up relations) */
export async function deleteProblem(id: number): Promise<void> {
  await execute("DELETE FROM problems WHERE id = $1", [id]);
}
