import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getDepartments() {
  return db.select().from(departments).orderBy(asc(departments.name));
}

export async function createDepartment(name: string, description?: string) {
  const result = await db
    .insert(departments)
    .values({
      name,
      description: description ?? null,
    })
    .returning();

  return result[0];
}

export async function updateDepartment(
  id: string,
  name: string,
  description?: string,
) {
  return db
    .update(departments)
    .set({
      name,
      description: description ?? null,
      updatedAt: new Date(),
    })
    .where(eq(departments.id, id))
    .returning();
}

export async function deleteDepartment(id: string) {
  return db.delete(departments).where(eq(departments.id, id)).returning();
}
