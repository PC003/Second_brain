// ============================================================
// DATA SERVICE — Second Brain
// Full database export/import/reset via Excel (.xlsx) / JSON serialization
// Uses SheetJS (xlsx) and existing SQL plugin
// ============================================================

import * as XLSX from "xlsx";
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

// ---- Raw Database Export ----

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

// ---- Excel Export ----

/** Export all database tables as an Excel (.xlsx) workbook Uint8Array */
export async function exportAllDataToExcel(): Promise<Uint8Array> {
  const data = await exportAllData();

  const wb = XLSX.utils.book_new();

  // 1. Metadata Sheet
  const metadataRows = [
    { Key: "version", Value: data.version },
    { Key: "exported_at", Value: data.exported_at },
    { Key: "app", Value: "Second Brain" },
    { Key: "problems_count", Value: data.problems?.length ?? 0 },
    { Key: "patterns_count", Value: data.patterns?.length ?? 0 },
    { Key: "platforms_count", Value: data.platforms?.length ?? 0 },
    { Key: "contests_count", Value: data.contests?.length ?? 0 },
  ];
  const metadataWs = XLSX.utils.json_to_sheet(metadataRows);
  XLSX.utils.book_append_sheet(wb, metadataWs, "Metadata");

  // 2. Data Sheets
  const problemsWs = XLSX.utils.json_to_sheet(data.problems || []);
  XLSX.utils.book_append_sheet(wb, problemsWs, "Problems");

  const platformsWs = XLSX.utils.json_to_sheet(data.platforms || []);
  XLSX.utils.book_append_sheet(wb, platformsWs, "Platforms");

  const patternsWs = XLSX.utils.json_to_sheet(data.patterns || []);
  XLSX.utils.book_append_sheet(wb, patternsWs, "Patterns");

  const tagsWs = XLSX.utils.json_to_sheet(data.tags || []);
  XLSX.utils.book_append_sheet(wb, tagsWs, "Tags");

  const problemPatternsWs = XLSX.utils.json_to_sheet(data.problem_patterns || []);
  XLSX.utils.book_append_sheet(wb, problemPatternsWs, "Problem_Patterns");

  const problemTagsWs = XLSX.utils.json_to_sheet(data.problem_tags || []);
  XLSX.utils.book_append_sheet(wb, problemTagsWs, "Problem_Tags");

  const contestsWs = XLSX.utils.json_to_sheet(data.contests || []);
  XLSX.utils.book_append_sheet(wb, contestsWs, "Contests");

  const contestProblemsWs = XLSX.utils.json_to_sheet(data.contest_problems || []);
  XLSX.utils.book_append_sheet(wb, contestProblemsWs, "Contest_Problems");

  const revisionHistoryWs = XLSX.utils.json_to_sheet(data.revision_history || []);
  XLSX.utils.book_append_sheet(wb, revisionHistoryWs, "Revision_History");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(buffer);
}

// ---- Excel Import Parsing ----

/** Parse an Excel (.xlsx) buffer into a SecondBrainExport object */
export function parseExcelToExportData(buffer: Uint8Array): SecondBrainExport {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetMap: Record<string, XLSX.WorkSheet> = {};

  for (const name of wb.SheetNames) {
    sheetMap[name.toLowerCase().replace(/[\s_-]/g, "")] = wb.Sheets[name];
  }

  function getRows<T extends Record<string, unknown>>(possibleSheetKeys: string[]): T[] {
    for (const k of possibleSheetKeys) {
      const sheet = sheetMap[k];
      if (sheet) {
        return XLSX.utils.sheet_to_json<T>(sheet, { defval: null });
      }
    }
    return [];
  }

  // Parse metadata if present
  let version = EXPORT_VERSION;
  let exported_at = new Date().toISOString();
  const metaRows = getRows<Record<string, unknown>>(["metadata", "info"]);

  for (const row of metaRows) {
    const k = String(row.Key ?? row.key ?? row.field ?? row.name ?? Object.values(row)[0] ?? "").toLowerCase();
    const v = row.Value ?? row.value ?? Object.values(row)[1];
    if (k === "version" && v != null) {
      const num = Number(v);
      if (!isNaN(num)) version = num;
    } else if (k === "exported_at" && v != null) {
      exported_at = String(v);
    }
  }

  const rawPlatforms = getRows<Record<string, unknown>>(["platforms", "platform"]);
  const rawPatterns = getRows<Record<string, unknown>>(["patterns", "pattern"]);
  const rawTags = getRows<Record<string, unknown>>(["tags", "tag"]);
  const rawProblems = getRows<Record<string, unknown>>(["problems", "problem"]);
  const rawProblemPatterns = getRows<Record<string, unknown>>([
    "problempatterns",
    "problempattern",
    "problem_patterns",
  ]);
  const rawProblemTags = getRows<Record<string, unknown>>([
    "problemtags",
    "problemtag",
    "problem_tags",
  ]);
  const rawContests = getRows<Record<string, unknown>>(["contests", "contest"]);
  const rawContestProblems = getRows<Record<string, unknown>>([
    "contestproblems",
    "contestproblem",
    "contest_problems",
  ]);
  const rawRevisionHistory = getRows<Record<string, unknown>>([
    "revisionhistory",
    "revisions",
    "revision",
    "revision_history",
  ]);

  if (!rawPlatforms.length && !rawProblems.length) {
    throw new Error("Invalid Excel export file: missing required Problems or Platforms sheets.");
  }

  const platforms: Platform[] = rawPlatforms.map((p) => ({
    id: Number(p.id),
    name: String(p.name || ""),
    type: (p.type as Platform["type"]) || "both",
    is_default: p.is_default ? 1 : 0,
    profile_username: p.profile_username ? String(p.profile_username) : null,
    last_synced_at: p.last_synced_at ? String(p.last_synced_at) : null,
    stats_json: p.stats_json ? String(p.stats_json) : null,
    created_at: p.created_at ? String(p.created_at) : new Date().toISOString(),
  }));

  const patterns: Pattern[] = rawPatterns.map((p) => ({
    id: Number(p.id),
    name: String(p.name || ""),
    group_name: p.group_name ? String(p.group_name) : "",
    is_default: p.is_default ? 1 : 0,
    created_at: p.created_at ? String(p.created_at) : new Date().toISOString(),
  }));

  const tags: Tag[] = rawTags.map((t) => ({
    id: Number(t.id),
    name: String(t.name || ""),
    type: (t.type as Tag["type"]) || "cp",
    created_at: t.created_at ? String(t.created_at) : new Date().toISOString(),
  }));

  const problems: Problem[] = rawProblems.map((p) => ({
    id: Number(p.id),
    title: String(p.title || ""),
    url: String(p.url || ""),
    platform_id: Number(p.platform_id),
    category: (p.category as Problem["category"]) || "dsa",
    difficulty: (p.difficulty as Problem["difficulty"]) || "medium",
    status: (p.status as Problem["status"]) || "to_solve",
    approach: p.approach != null ? String(p.approach) : "",
    key_observation: p.key_observation != null ? String(p.key_observation) : "",
    algorithm: p.algorithm != null ? String(p.algorithm) : "",
    why_it_works: p.why_it_works != null ? String(p.why_it_works) : "",
    time_complexity: p.time_complexity != null ? String(p.time_complexity) : "",
    space_complexity: p.space_complexity != null ? String(p.space_complexity) : "",
    mistake: p.mistake != null ? String(p.mistake) : "",
    lessons: p.lessons != null ? String(p.lessons) : "",
    notes: p.notes != null ? String(p.notes) : "",
    rough_work: p.rough_work != null ? String(p.rough_work) : "",
    code: p.code != null ? String(p.code) : "",
    code_language: (p.code_language as Problem["code_language"]) || "cpp",
    last_solved_at: p.last_solved_at ? String(p.last_solved_at) : null,
    last_reviewed_at: p.last_reviewed_at ? String(p.last_reviewed_at) : null,
    next_review_date: p.next_review_date ? String(p.next_review_date) : null,
    created_at: p.created_at ? String(p.created_at) : new Date().toISOString(),
    updated_at: p.updated_at ? String(p.updated_at) : new Date().toISOString(),
  }));

  const problem_patterns: ProblemPattern[] = rawProblemPatterns.map((pp) => ({
    problem_id: Number(pp.problem_id),
    pattern_id: Number(pp.pattern_id),
  }));

  const problem_tags: ProblemTag[] = rawProblemTags.map((pt) => ({
    problem_id: Number(pt.problem_id),
    tag_id: Number(pt.tag_id),
  }));

  const contests: Contest[] = rawContests.map((c) => ({
    id: Number(c.id),
    name: String(c.name || ""),
    platform_id: Number(c.platform_id),
    url: c.url ? String(c.url) : "",
    contest_date: c.contest_date ? String(c.contest_date) : "",
    rating_before: c.rating_before != null && c.rating_before !== "" ? Number(c.rating_before) : null,
    rating_change: c.rating_change != null && c.rating_change !== "" ? Number(c.rating_change) : null,
    rating_after: c.rating_after != null && c.rating_after !== "" ? Number(c.rating_after) : null,
    notes: c.notes ? String(c.notes) : "",
    created_at: c.created_at ? String(c.created_at) : new Date().toISOString(),
    updated_at: c.updated_at ? String(c.updated_at) : new Date().toISOString(),
  }));

  const contest_problems: ContestProblem[] = rawContestProblems.map((cp) => ({
    id: Number(cp.id),
    contest_id: Number(cp.contest_id),
    problem_id: cp.problem_id != null && cp.problem_id !== "" ? Number(cp.problem_id) : null,
    problem_label: cp.problem_label ? String(cp.problem_label) : "",
    solved: cp.solved ? 1 : 0,
    time_taken: cp.time_taken != null && cp.time_taken !== "" ? Number(cp.time_taken) : null,
    notes: cp.notes ? String(cp.notes) : "",
  }));

  const revision_history: RevisionHistory[] = rawRevisionHistory.map((r) => ({
    id: Number(r.id),
    problem_id: Number(r.problem_id),
    reviewed_at: r.reviewed_at ? String(r.reviewed_at) : new Date().toISOString(),
    result: (r.result as RevisionHistory["result"]) || "solved",
    notes: r.notes ? String(r.notes) : "",
  }));

  return {
    version,
    exported_at,
    platforms,
    patterns,
    tags,
    problems,
    problem_patterns,
    problem_tags,
    contests,
    contest_problems,
    revision_history,
  };
}

// ---- Import from Excel Buffer ----

/** Validate and import data from an Excel (.xlsx) file buffer.
 *  This REPLACES all existing data (destructive import). */
export async function importAllDataFromExcel(
  buffer: Uint8Array
): Promise<{ problems: number; patterns: number; platforms: number }> {
  const exportData = parseExcelToExportData(buffer);
  return importAllData(exportData);
}

// ---- Core Database Import ----

/** Validate and import data from a SecondBrainExport object.
 *  This REPLACES all existing data (destructive import). */
export async function importAllData(
  data: SecondBrainExport
): Promise<{ problems: number; patterns: number; platforms: number }> {
  // Basic validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid export file: not a valid data structure.");
  }
  if (!data.version || data.version > EXPORT_VERSION) {
    throw new Error(
      `Unsupported export version: ${data.version}. This app supports version ${EXPORT_VERSION}.`
    );
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
      "INSERT INTO platforms (id, name, type, created_at, profile_username, last_synced_at, stats_json) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        p.id,
        p.name,
        p.type || "both",
        p.created_at || new Date().toISOString(),
        p.profile_username || null,
        p.last_synced_at || null,
        p.stats_json || null,
      ]
    );
  }

  // Re-insert patterns
  for (const p of data.patterns) {
    await execute(
      "INSERT INTO patterns (id, name, group_name, is_default, created_at) VALUES ($1, $2, $3, $4, $5)",
      [
        p.id,
        p.name,
        p.group_name || "",
        p.is_default ? 1 : 0,
        p.created_at || new Date().toISOString(),
      ]
    );
  }

  // Re-insert tags
  for (const t of data.tags) {
    await execute(
      "INSERT INTO tags (id, name, type, created_at) VALUES ($1, $2, $3, $4)",
      [t.id, t.name, t.type || "cp", t.created_at || new Date().toISOString()]
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
        p.id,
        p.title,
        p.url,
        p.platform_id,
        p.category || "dsa",
        p.difficulty || "medium",
        p.status || "to_solve",
        p.approach ?? "",
        p.key_observation ?? "",
        p.algorithm ?? "",
        p.why_it_works ?? "",
        p.time_complexity ?? "",
        p.space_complexity ?? "",
        p.mistake ?? "",
        p.lessons ?? "",
        p.notes ?? "",
        p.rough_work ?? "",
        p.code ?? "",
        p.code_language || "cpp",
        p.last_solved_at || null,
        p.last_reviewed_at || null,
        p.next_review_date || null,
        p.created_at || new Date().toISOString(),
        p.updated_at || new Date().toISOString(),
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
      [
        c.id,
        c.name,
        c.platform_id,
        c.url ?? "",
        c.contest_date ?? "",
        c.rating_before != null && (c.rating_before as unknown) !== "" ? Number(c.rating_before) : null,
        c.rating_change != null && (c.rating_change as unknown) !== "" ? Number(c.rating_change) : null,
        c.rating_after != null && (c.rating_after as unknown) !== "" ? Number(c.rating_after) : null,
        c.notes ?? "",
        c.created_at || new Date().toISOString(),
        c.updated_at || new Date().toISOString(),
      ]
    );
  }

  for (const cp of data.contest_problems || []) {
    await execute(
      `INSERT INTO contest_problems (id, contest_id, problem_id, problem_label, solved, time_taken, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        cp.id,
        cp.contest_id,
        cp.problem_id != null && (cp.problem_id as unknown) !== "" ? Number(cp.problem_id) : null,
        cp.problem_label ?? "",
        cp.solved ? 1 : 0,
        cp.time_taken != null && (cp.time_taken as unknown) !== "" ? Number(cp.time_taken) : null,
        cp.notes ?? "",
      ]
    );
  }

  // Re-insert revision history
  for (const r of data.revision_history || []) {
    await execute(
      `INSERT INTO revision_history (id, problem_id, reviewed_at, result, notes)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        r.id,
        r.problem_id,
        r.reviewed_at || new Date().toISOString(),
        r.result || "solved",
        r.notes ?? "",
      ]
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
