import { db, type TxDb } from "@/lib/db";
import { patients, users, appointments, doctors } from "@/lib/db/schema";
import { eq, isNull, and, sql, desc } from "drizzle-orm";

export async function createPatientProfile(userId: string, txDb: TxDb = db) {
  const result = await txDb
    .insert(patients)
    .values({
      userId,
      firstName: "",
      lastName: "",
    })
    .returning();

  return result[0];
}

export async function getPatientsForDoctor(userId: string) {
  return db
    .select({
      patient_id: patients.id,
      first_name: patients.firstName,
      last_name: patients.lastName,
      email: users.email,
      gender: patients.gender,
      contact_number: patients.contactNumber,
      total_visits: sql<number>`count(${appointments.id})::int`,
      last_visit: sql<string | null>`max(${appointments.appointmentDatetime})`,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(and(eq(doctors.userId, userId), isNull(appointments.deletedAt)))
    .groupBy(
      patients.id,
      patients.firstName,
      patients.lastName,
      users.email,
      patients.gender,
      patients.contactNumber,
    )
    .orderBy(desc(sql`last_visit`));
}

export async function getAllPatientsAdmin() {
  return db
    .select({
      patient_id: patients.id,
      first_name: patients.firstName,
      last_name: patients.lastName,
      email: users.email,
      gender: patients.gender,
      contact_number: patients.contactNumber,
      created_at: users.createdAt,
      total_visits: sql<number>`count(${appointments.id})::int`,
    })
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.id))
    .leftJoin(
      appointments,
      and(
        eq(appointments.patientId, patients.id),
        isNull(appointments.deletedAt),
      ),
    )
    .where(isNull(patients.deletedAt))
    .groupBy(
      patients.id,
      patients.firstName,
      patients.lastName,
      users.email,
      patients.gender,
      patients.contactNumber,
      users.createdAt,
    )
    .orderBy(desc(users.createdAt));
}
