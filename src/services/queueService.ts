import Database from "@tauri-apps/plugin-sql";
import { DB_NAME } from "../utils/constants";
import type { ProblemQueueItemWithPlatform } from "../types";

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load(DB_NAME);
  }
  return db;
}

export async function getQueue(): Promise<ProblemQueueItemWithPlatform[]> {
  const database = await getDb();
  return await database.select<ProblemQueueItemWithPlatform[]>(
    `SELECT q.*, p.name as platform_name 
     FROM problem_queue q
     JOIN platforms p ON q.platform_id = p.id
     ORDER BY q.created_at DESC`
  );
}

export async function addToQueue(platformId: number, title: string): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO problem_queue (platform_id, title) VALUES ($1, $2)",
    [platformId, title]
  );
  return result.lastInsertId as number;
}

export async function removeFromQueue(id: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM problem_queue WHERE id = $1", [id]);
}
