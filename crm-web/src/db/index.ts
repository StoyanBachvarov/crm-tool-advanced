import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

type Database = NonNullable<ReturnType<typeof createDatabase>>;

let database: Database | null = null;

function getDatabase(): Database {
  database ??= createDatabase();

  if (!database) {
    throw new Error("DATABASE_URL is not configured");
  }

  return database;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDatabase(), prop, receiver);
  },
});
