import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createUser } from "@/features/auth/auth.service";

async function seed() {
  await createUser("admin@medflow.com", "admin123", "admin");

  await createUser("doc1@medflow.com", "doctor123", "doctor");
  await createUser("doc2@medflow.com", "doctor123", "doctor");

  await createUser("pat1@medflow.com", "patient123", "patient");
  await createUser("pat2@medflow.com", "patient123", "patient");

  console.log("Seed complete");
}

seed();
