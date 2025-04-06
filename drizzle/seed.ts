import "dotenv/config.js";
import * as schema from "./schema";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const env = process.env;
const { userTable, userImageTable, connectionTable, sessionTable } = schema;

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
const db = drizzle(client, { schema });

const user1 = (
  await db
    .insert(userTable)
    .values({
      email: "user1@example.com",
      username: "user1",
      display_name: "User One",
    })
    .returning()
)[0]!;

const user2 = (
  await db
    .insert(userTable)
    .values({
      email: "user2@example.com",
      username: "user2",
      display_name: "User Two",
    })
    .returning()
)[0]!;

console.log("Users created: ", user1, user2);

// Create sample user images
const image1 = await db.insert(userImageTable).values({
  user_id: user1.id, // Assuming you use the user's ID from the previous insert
  content_type: "image/png",
  blob: Buffer.from("some binary data representing the image"),
});

const image2 = await db.insert(userImageTable).values({
  user_id: user2.id,
  content_type: "image/jpeg",
  blob: Buffer.from("other binary data representing the image"),
});

console.log("User images created: ", image1, image2);

// Create sample connections (associating users with external providers)
const connection1 = await db.insert(connectionTable).values({
  provider_name: "google",
  provider_id: "google-12345",
  user_id: user1.id,
});

const connection2 = await db.insert(connectionTable).values({
  provider_name: "facebook",
  provider_id: "facebook-67890",
  user_id: user2.id,
});

console.log("Connections created: ", connection1, connection2);

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

// Create sample sessions for users
const session1 = await db.insert(sessionTable).values({
  user_id: user1.id,
  expiration_at: getSessionExpirationDate(),
});

const session2 = await db.insert(sessionTable).values({
  user_id: user2.id,
  expiration_at: getSessionExpirationDate(),
});

console.log("Sessions created: ", session1, session2);
