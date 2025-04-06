import "dotenv/config.js";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const env = process.env;

if (!env.TURSO_DB_URL) {
  throw new Error("Invalid environment variables TURSO_DB_URL");
}

if (!env.TURSO_DB_AUTH_TOKEN) {
  throw new Error("Invalid environment variables TURSO_DB_AUTH_TOKEN");
}

if (env.TURSO_DB_URL.startsWith("file:")) {
  mkdirSync(dirname(env.TURSO_DB_URL.slice(5)), { recursive: true });
}

const client = createClient({
  url: env.TURSO_DB_URL,
  authToken: env.TURSO_DB_AUTH_TOKEN,
});
const db = drizzle(client);

console.log("Running database migrations...");
console.time("🤖 Migrated");
await migrate(db, { migrationsFolder: "./drizzle" });
console.timeEnd("🤖 Migrated");

client.close();
