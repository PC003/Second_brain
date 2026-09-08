// ============================================================
// DATA SERVICE — Second Brain
// Full database export/import/reset via JSON serialization
// Uses existing SQL plugin — no custom Rust commands needed
// ============================================================

import { execute, select } from "./database";
import type {
  Platform,
  Pattern,
  Tag,
  Problem,
  ProblemPattern,
  ProblemTag,
  Contest,
  ContestProblem,
  RevisionHistory,
  SecondBrainExport,
} from "../types";

const EXPORT_VERSION = 1;

// ---- Export ----

/** Serialize all database tables to a SecondBrainExport object */
export async function exportAllData(): Promise<SecondBrainExport> {
  const [
    platforms,
    patterns,
    tags,
    problems,
    problemPatterns,
    problemTags,
    contests,
    contestProblems,
    revisionHistory,
  ] = await Promise.all([
    select<Platform>("SELECT * FROM platforms ORDER BY id"),
    select<Pattern>("SELECT * FROM patterns ORDER BY id"),
    select<Tag>("SELECT * FROM tags ORDER BY id"),
    select<Problem>("SELECT * FROM problems ORDER BY id"),
    select<ProblemPattern>("SELECT * FROM problem_patterns"),
    select<ProblemTag>("SELECT * FROM problem_tags"),
    select<Contest>("SELECT * FROM contests ORDER BY id"),
    select<ContestProblem>("SELECT * FROM contest_problems ORDER BY id"),
    select<RevisionHistory>("SELECT * FROM revision_history ORDER BY id"),
  ]);

  return {
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    platforms,
    patterns,
    tags,
    problems,
    problem_patterns: problemPatterns,
    problem_tags: problemTags,
    contests,
    contest_problems: contestProblems,
    revision_history: revisionHistory,
  };
}

// ---- Import ----

/** Validate and import data from a SecondBrainExport JSON object.
 *  This REPLACES all existing data (destructive import). */
export async function importAllData(data: SecondBrainExport): Promise<{ problems: number; patterns: number; platforms: number }> {
  // Basic validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid export file: not a valid JSON object.");
  }
  if (!data.version || data.version > EXPORT_VERSION) {
    throw new Error(`Unsupported export version: ${data.version}. This app supports version ${EXPORT_VERSION}.`);
  }
  if (!Array.isArray(data.platforms) || !Array.isArray(data.problems)) {
    throw new Error("Invalid export file: missing required data arrays.");
  }

  // Clear all tables in correct order (child → parent to avoid FK violations)
  await execute("DELETE FROM revision_history");
  await execute("DELETE FROM contest_problems");
  await execute("DELETE FROM contests");
  await execute("DELETE FROM problem_tags");
  await execute("DELETE FROM problem_patterns");
  await execute("DELETE FROM problems");
  await execute("DELETE FROM patterns");
  await execute("DELETE FROM tags");
  await execute("DELETE FROM platforms");

  // Clear FTS index
  await execute("DELETE FROM problems_fts");

  // Re-insert platforms
  for (const p of data.platforms) {
    await execute(
      "INSERT INTO platforms (id, name, type, created_at) VALUES ($1, $2, $3, $4)",
      [p.id, p.name, p.type, p.created_at]
    );
  }

  // Re-insert patterns
  for (const p of data.patterns) {
    await execute(
      "INSERT INTO patterns (id, name, group_name, is_default, created_at) VALUES ($1, $2, $3, $4, $5)",
      [p.id, p.name, p.group_name, p.is_default, p.created_at]
    );
  }

  // Re-insert tags
  for (const t of data.tags) {
    await execute(
      "INSERT INTO tags (id, name, type, created_at) VALUES ($1, $2, $3, $4)",
      [t.id, t.name, t.type, t.created_at]
    );
  }

  // Re-insert problems (triggers will rebuild FTS)
  for (const p of data.problems) {
    await execute(
      `INSERT INTO problems (
        id, title, url, platform_id, category, difficulty, status,
        approach, key_observation, algorithm, why_it_works,
        time_complexity, space_complexity, mistake, lessons, notes, rough_work,
        code, code_language, last_solved_at, last_reviewed_at,
        next_review_date, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        p.id, p.title, p.url, p.platform_id, p.category, p.difficulty, p.status,
        p.approach, p.key_observation, p.algorithm, p.why_it_works,
        p.time_complexity, p.space_complexity, p.mistake, p.lessons, p.notes, p.rough_work,
        p.code, p.code_language, p.last_solved_at, p.last_reviewed_at,
        p.next_review_date, p.created_at, p.updated_at,
      ]
    );
  }

  // Re-insert junction tables
  for (const pp of data.problem_patterns || []) {
    await execute(
      "INSERT INTO problem_patterns (problem_id, pattern_id) VALUES ($1, $2)",
      [pp.problem_id, pp.pattern_id]
    );
  }

  for (const pt of data.problem_tags || []) {
    await execute(
      "INSERT INTO problem_tags (problem_id, tag_id) VALUES ($1, $2)",
      [pt.problem_id, pt.tag_id]
    );
  }

  // Re-insert contests
  for (const c of data.contests || []) {
    await execute(
      `INSERT INTO contests (id, name, platform_id, url, contest_date, rating_before, rating_change, rating_after, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [c.id, c.name, c.platform_id, c.url, c.contest_date, c.rating_before, c.rating_change, c.rating_after, c.notes, c.created_at, c.updated_at]
    );
  }

  for (const cp of data.contest_problems || []) {
    await execute(
      `INSERT INTO contest_problems (id, contest_id, problem_id, problem_label, solved, time_taken, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [cp.id, cp.contest_id, cp.problem_id, cp.problem_label, cp.solved, cp.time_taken, cp.notes]
    );
  }

  // Re-insert revision history
  for (const r of data.revision_history || []) {
    await execute(
      `INSERT INTO revision_history (id, problem_id, reviewed_at, result, notes)
       VALUES ($1,$2,$3,$4,$5)`,
      [r.id, r.problem_id, r.reviewed_at, r.result, r.notes]
    );
  }

  return {
    problems: data.problems.length,
    patterns: data.patterns.length,
    platforms: data.platforms.length,
  };
}

// ---- Reset ----

/** Delete ALL user data from the database.
 *  Seed data (platforms, patterns, tags) will NOT be re-inserted —
 *  they'll be restored on the next app restart via migrations. */
export async function resetAllData(): Promise<void> {
  await execute("DELETE FROM revision_history");
  await execute("DELETE FROM contest_problems");
  await execute("DELETE FROM contests");
  await execute("DELETE FROM problem_tags");
  await execute("DELETE FROM problem_patterns");
  await execute("DELETE FROM problems");
  await execute("DELETE FROM patterns");
  await execute("DELETE FROM tags");
  await execute("DELETE FROM platforms");
  await execute("DELETE FROM problems_fts");
}

// ---- Stats (for settings display) ----

/** Get a quick count of all entities for the data management section */
export async function getDataStats(): Promise<{
  problems: number;
  patterns: number;
  platforms: number;
  contests: number;
  revisions: number;
}> {
  const [problems, patterns, platforms, contests, revisions] = await Promise.all([
    select<{ c: number }>("SELECT COUNT(*) as c FROM problems"),
    select<{ c: number }>("SELECT COUNT(*) as c FROM patterns"),
    select<{ c: number }>("SELECT COUNT(*) as c FROM platforms"),
    select<{ c: number }>("SELECT COUNT(*) as c FROM contests"),
    select<{ c: number }>("SELECT COUNT(*) as c FROM revision_history"),
  ]);

  return {
    problems: problems[0]?.c || 0,
    patterns: patterns[0]?.c || 0,
    platforms: platforms[0]?.c || 0,
    contests: contests[0]?.c || 0,
    revisions: revisions[0]?.c || 0,
  };
}
