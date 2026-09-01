// ============================================================
// TAG SERVICE — Second Brain
// CRUD for CP tags
// ============================================================

import { execute, select } from "./database";
import type { Tag, TagWithStats } from "../types";

/** Get all tags */
export async function getAllTags(): Promise<Tag[]> {
  return select<Tag>("SELECT * FROM tags ORDER BY name");
}

/** Get all tags with problem counts */
export async function getTagsWithStats(): Promise<TagWithStats[]> {
  return select<TagWithStats>(`
    SELECT
      t.*,
      COUNT(pt.problem_id) as problem_count
    FROM tags t
    LEFT JOIN problem_tags pt ON t.id = pt.tag_id
    GROUP BY t.id
    ORDER BY t.name
  `);
}

/** Create a new tag */
export async function createTag(name: string, type: string = "cp"): Promise<number> {
  const result = await execute(
    "INSERT INTO tags (name, type) VALUES ($1, $2)",
    [name, type]
  );
  return result.lastInsertId;
}

/** Update a tag */
export async function updateTag(id: number, name: string): Promise<void> {
  await execute("UPDATE tags SET name = $1 WHERE id = $2", [name, id]);
}

/** Delete a tag */
export async function deleteTag(id: number): Promise<void> {
  await execute("DELETE FROM tags WHERE id = $1", [id]);
}

/** Get tag IDs for a problem */
export async function getTagIdsForProblem(problemId: number): Promise<number[]> {
  const rows = await select<{ tag_id: number }>(
    "SELECT tag_id FROM problem_tags WHERE problem_id = $1",
    [problemId]
  );
  return rows.map((r) => r.tag_id);
}

/** Get tags for a problem */
export async function getTagsForProblem(problemId: number): Promise<Tag[]> {
  return select<Tag>(`
    SELECT t.* FROM tags t
    INNER JOIN problem_tags pt ON t.id = pt.tag_id
    WHERE pt.problem_id = $1
    ORDER BY t.name
  `, [problemId]);
}
