import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

export const client = postgres(dbUrl, {
  ssl: false,
});

export const db = drizzle(client, { schema });
export type TxDb = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
export { schema };
