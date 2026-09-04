import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import postgres from "postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL is not set in .env.local!");
    console.error("Please create a .env.local file with your PostgreSQL connection string:");
    console.error('DATABASE_URL="postgres://username:password@localhost:5432/dbname"');
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), "scripts", "init-db.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Error: Could not find SQL file at ${sqlPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  console.log("Connecting to PostgreSQL database...");
  const sql = postgres(dbUrl, { ssl: false });

  try {
    console.log("Creating medflow schema and tables...");
    await sql.unsafe(sqlContent);
    console.log("✅ Database schema and tables created successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize database schema:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
