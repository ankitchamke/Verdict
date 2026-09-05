import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPool() {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error(
        "DATABASE_URL is not configured. Please set DATABASE_URL in your environment or artifacts/api-server/.env.",
      );
    }
    _pool = new Pool({ connectionString: connStr });
  }
  return _pool;
}

export function getDb() {
  if (!_db) {
    const pool = getPool();
    _db = drizzle(pool, { schema });
  }
  return _db;
}

export const pool = {
  get current() {
    return getPool();
  },
};

export const db = {
  get current() {
    return getDb();
  },
};

export * from "./schema";
