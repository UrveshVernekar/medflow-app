import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function getUserByEmail(email: string) {
  const result = await db`
    SELECT * FROM medflow.users
    WHERE email = ${email}
    AND deleted_at IS NULL
    LIMIT 1
  `;
  return result[0] ?? null;
}

export async function createUser(
  email: string,
  password: string,
  role: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db`
    INSERT INTO medflow.users (email, password_hash, role)
    VALUES (${email}, ${hashedPassword}, ${role})
    RETURNING id, email, role
  `;

  return result[0];
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
