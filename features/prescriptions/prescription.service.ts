import { db, TxDb } from "@/lib/db";
import {
  prescriptions,
  prescriptionItems,
  patientAllergies,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { CreatePrescriptionInput, AddPatientAllergyInput } from "./prescription.schema";

export async function createPrescription(
  doctorId: string,
  input: CreatePrescriptionInput,
  tx?: TxDb
) {
  const dbClient = tx || db;

  return await dbClient.transaction(async (trx) => {
    // 1. Insert master prescription
    const [script] = await trx
      .insert(prescriptions)
      .values({
        doctorId,
        patientId: input.patientId,
        appointmentId: input.appointmentId || null,
        diagnosis: input.diagnosis,
        notes: input.notes || null,
        status: "active",
      })
      .returning();

    // 2. Insert items
    const itemsToInsert = input.items.map((item) => ({
      prescriptionId: script.id,
      medicationName: item.medicationName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || null,
    }));

    await trx.insert(prescriptionItems).values(itemsToInsert);

    return script;
  });
}

export async function getPatientPrescriptions(patientId: string) {
  const results = await db.query.prescriptions.findMany({
    where: eq(prescriptions.patientId, patientId),
    orderBy: [desc(prescriptions.issuedAt)],
    with: {
      doctor: {
        with: {
          user: true,
        },
      },
      items: true,
    },
  });

  return results.map((p) => ({
    id: p.id,
    diagnosis: p.diagnosis,
    notes: p.notes,
    status: p.status,
    issuedAt: p.issuedAt,
    doctorName: `Dr. ${p.doctor.user.firstName || ""} ${p.doctor.user.lastName || ""}`.trim(),
    specialization: p.doctor.specialization,
    items: p.items.map((item) => ({
      id: item.id,
      medicationName: item.medicationName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
    })),
  }));
}

export async function getDoctorIssuedPrescriptions(doctorId: string) {
  const results = await db.query.prescriptions.findMany({
    where: eq(prescriptions.doctorId, doctorId),
    orderBy: [desc(prescriptions.issuedAt)],
    with: {
      patient: {
        with: {
          user: true,
        },
      },
      items: true,
    },
  });

  return results.map((p) => ({
    id: p.id,
    diagnosis: p.diagnosis,
    notes: p.notes,
    status: p.status,
    issuedAt: p.issuedAt,
    patientName: `${p.patient.firstName || ""} ${p.patient.lastName || ""}`.trim(),
    patientEmail: p.patient.user.email,
    itemsCount: p.items.length,
    items: p.items,
  }));
}

export async function addPatientAllergy(input: AddPatientAllergyInput) {
  const [newAllergy] = await db
    .insert(patientAllergies)
    .values({
      patientId: input.patientId,
      allergen: input.allergen,
      severity: input.severity,
      reaction: input.reaction || null,
    })
    .returning();

  return newAllergy;
}

export async function getPatientAllergies(patientId: string) {
  return await db.query.patientAllergies.findMany({
    where: eq(patientAllergies.patientId, patientId),
    orderBy: [desc(patientAllergies.createdAt)],
  });
}
