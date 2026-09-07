import { db, type TxDb } from "@/lib/db";
import { doctors, users, departments } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";

export async function createDoctorProfile(
  userId: string,
  data: {
    specialization: string;
    license_number: string;
    years_of_experience: number;
    department_id: string;
  },
  txDb: TxDb = db,
) {
  const result = await txDb
    .insert(doctors)
    .values({
      userId,
      specialization: data.specialization,
      licenseNumber: data.license_number,
      yearsOfExperience: data.years_of_experience,
      departmentId: data.department_id,
    })
    .returning();

  return result[0];
}

export async function getDoctors(departmentId?: string) {
  const whereClause = departmentId
    ? and(eq(doctors.departmentId, departmentId), isNull(doctors.deletedAt))
    : isNull(doctors.deletedAt);

  const result = await db
    .select({
      id: doctors.id,
      user_id: doctors.userId,
      specialization: doctors.specialization,
      license_number: doctors.licenseNumber,
      years_of_experience: doctors.yearsOfExperience,
      department_id: doctors.departmentId,
      created_at: doctors.createdAt,
      updated_at: doctors.updatedAt,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      department_name: departments.name,
    })
    .from(doctors)
    .innerJoin(users, eq(doctors.userId, users.id))
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(whereClause)
    .orderBy(desc(doctors.createdAt));

  return result.map((d) => ({
    ...d,
    name: [d.firstName, d.lastName].filter(Boolean).join(" ") || "Dr. Unnamed",
  }));
}
