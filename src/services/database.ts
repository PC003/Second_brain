// ============================================================
// DATABASE SERVICE — Second Brain
// Singleton connection to SQLite via tauri-plugin-sql
// ============================================================

import Database from "@tauri-apps/plugin-sql";
import { DB_NAME } from "../utils/constants";

let db: Database | null = null;

/**
 * Get the database connection singleton.
 * The first call loads the database and runs any pending migrations
 * (handled automatically by tauri-plugin-sql on the Rust side).
 */
export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load(DB_NAME);
  }
  return db;
}

/**
 * Execute a SQL statement that modifies data (INSERT, UPDATE, DELETE).
 * Returns the number of affected rows and last insert ID.
 */
export async function execute(
  sql: string,
  bindValues?: unknown[]
): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const database = await getDb();
  const result = await database.execute(sql, bindValues);
  return {
    rowsAffected: result.rowsAffected,
    lastInsertId: (result.lastInsertId as number) || 0,
  };
}

/**
 * Execute a SQL SELECT query.
 * Returns an array of rows typed as T.
 */
export async function select<T>(sql: string, bindValues?: unknown[]): Promise<T[]> {
  const database = await getDb();
  return database.select<T[]>(sql, bindValues);
}
