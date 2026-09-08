// ============================================================
// PLATFORM SERVICE — Second Brain
// CRUD operations for the platforms table
// ============================================================

import { execute, select } from "./database";
import type { Platform } from "../types";

/** Get all platforms */
export async function getAllPlatforms(): Promise<Platform[]> {
  return select<Platform>("SELECT * FROM platforms ORDER BY id");
}

/** Get a platform by ID */
export async function getPlatformById(id: number): Promise<Platform | null> {
  const rows = await select<Platform>("SELECT * FROM platforms WHERE id = $1", [id]);
  return rows[0] || null;
}

/** Get platforms by type (dsa, cp, both) */
export async function getPlatformsByType(type: string): Promise<Platform[]> {
  return select<Platform>(
    "SELECT * FROM platforms WHERE type = $1 OR type = 'both' ORDER BY id",
    [type]
  );
}

/** Create a new platform */
export async function createPlatform(name: string, type: string, profileUsername?: string): Promise<number> {
  const result = await execute(
    "INSERT INTO platforms (name, type, profile_username) VALUES ($1, $2, $3)",
    [name, type, profileUsername || null]
  );
  return result.lastInsertId;
}

/** Update a platform */
export async function updatePlatform(id: number, name: string, type: string, profileUsername?: string): Promise<void> {
  await execute(
    "UPDATE platforms SET name = $1, type = $2, profile_username = $3 WHERE id = $4",
    [name, type, profileUsername || null, id]
  );
}

/** Update a platform's stats */
export async function updatePlatformStats(id: number, statsJson: string): Promise<void> {
  await execute(
    "UPDATE platforms SET stats_json = $1, last_synced_at = datetime('now') WHERE id = $2",
    [statsJson, id]
  );
}

/** Delete a platform (will fail if referenced by problems) */
export async function deletePlatform(id: number): Promise<void> {
  await execute("DELETE FROM platforms WHERE id = $1", [id]);
}

/** Check if a platform is referenced by any problems */
export async function isPlatformInUse(id: number): Promise<boolean> {
  const rows = await select<{ count: number }>(
    "SELECT COUNT(*) as count FROM problems WHERE platform_id = $1",
    [id]
  );
  return rows[0].count > 0;
}
