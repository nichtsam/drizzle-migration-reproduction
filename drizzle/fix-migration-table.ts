import "dotenv/config.js";
import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import journal from "./meta/_journal.json";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const env = process.env;

if (!env.TURSO_DB_URL) {
  throw new Error("Invalid environment variables TURSO_DB_URL");
}

if (!env.TURSO_DB_AUTH_TOKEN) {
  throw new Error("Invalid environment variables TURSO_DB_AUTH_TOKEN");
}

const migrationsDir = "./drizzle";

const migrationTable = "__drizzle_migrations";

const client = createClient({
  url: env.TURSO_DB_URL,
  authToken: env.TURSO_DB_AUTH_TOKEN,
});
const db = drizzle(client);

db.run(`DROP TABLE IF EXISTS ${migrationTable};`)
  .then(console.log)
  .catch(console.error);

db.run(
  `
CREATE TABLE IF NOT EXISTS ${migrationTable}(
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at numeric
)`,
)
  .then(console.log)
  .catch(console.error);

db.run(`DELETE FROM ${migrationTable};`).then(console.log).catch(console.error);

for (const entry of journal.entries) {
  const { tag, when } = entry;
  const sqlFile = `${tag}.sql`;
  const fullSqlPath = join(migrationsDir, sqlFile);

  if (!readdirSync(migrationsDir).includes(sqlFile)) {
    console.error(`SQL file for migration ${tag} not found.`);
    continue;
  }

  const content = readFileSync(fullSqlPath);
  const hash = createHash("sha256").update(content).digest("hex");

  db.run(
    `INSERT INTO ${migrationTable} (hash, created_at) VALUES ('${hash}', ${when});`,
  )
    .then(console.log)
    .catch(console.error);
}

db.run("SELECT name FROM sqlite_master WHERE type='table';")
  .then(console.log)
  .catch(console.error);
db.run(`SELECT * FROM ${migrationTable};`)
  .then(console.log)
  .catch(console.error);
