import { db } from "@/lib/db";

export async function createPatientProfile(userId: string) {
  const result = await db`
    INSERT INTO medflow.patients (user_id, first_name, last_name)
    VALUES (${userId}, '', '')
    RETURNING *
  `;

  return result[0];
}
