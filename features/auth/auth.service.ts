import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (!result[0]) return null;

  // Map passwordHash to password_hash for backward compatibility with authConfig
  return {
    ...result[0],
    password_hash: result[0].passwordHash,
  };
}

export async function createUser(
  email: string,
  password: string,
  role: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db
    .insert(users)
    .values({
      email,
      passwordHash: hashedPassword,
      role,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

  return result[0];
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
