import "dotenv/config";
import { type Config } from "drizzle-kit";

const env = process.env;

if (!env.TURSO_DB_URL) {
  throw new Error("Invalid environment variables TURSO_DB_URL");
}

if (!env.TURSO_DB_AUTH_TOKEN) {
  throw new Error("Invalid environment variables TURSO_DB_AUTH_TOKEN");
}

export default {
  dialect: "turso",
  schema: ["./drizzle/schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_AUTH_TOKEN,
  },
} satisfies Config;
