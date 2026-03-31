import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

export const db = postgres(process.env.DATABASE_URL!, {
  // ssl: "require",
  ssl: false,
});
