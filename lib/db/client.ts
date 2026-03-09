import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let database: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (!database) {
    const client = postgres(connectionString, {
      prepare: false,
    });
    database = drizzle(client);
  }

  return database;
}
