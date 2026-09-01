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
export async function createPlatform(name: string, type: string): Promise<number> {
  const result = await execute(
    "INSERT INTO platforms (name, type) VALUES ($1, $2)",
    [name, type]
  );
  return result.lastInsertId;
}

/** Update a platform */
export async function updatePlatform(id: number, name: string, type: string): Promise<void> {
  await execute(
    "UPDATE platforms SET name = $1, type = $2 WHERE id = $3",
    [name, type, id]
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
