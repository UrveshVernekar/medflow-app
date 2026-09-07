"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { doctors, patients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createPrescriptionSchema,
  addPatientAllergySchema,
  CreatePrescriptionInput,
  AddPatientAllergyInput,
} from "./prescription.schema";
import {
  createPrescription,
  getPatientPrescriptions,
  getDoctorIssuedPrescriptions,
  addPatientAllergy,
  getPatientAllergies,
} from "./prescription.service";
import { checkDrugSafety } from "@/lib/openfda";
import { logAuditAction } from "@/lib/audit";

export async function checkPrescriptionSafetyAction(
  patientId: string,
  medications: string[]
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const allergies = await getPatientAllergies(patientId);
  const safetyResult = await checkDrugSafety(medications, allergies);

  return { success: true, safetyResult };
}

export async function createPrescriptionAction(input: CreatePrescriptionInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "doctor") {
    return { error: "Unauthorized. Only doctors can issue prescriptions." };
  }

  const parsed = createPrescriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input data", details: parsed.error.format() };
  }

  // Find doctor profile
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, session.user.id),
  });

  if (!doctor) {
    return { error: "Doctor profile not found." };
  }

  const newScript = await createPrescription(doctor.id, parsed.data);

  await logAuditAction({
    userId: session.user.id,
    action: "ISSUE_PRESCRIPTION",
    resource: "prescription",
    resourceId: newScript.id,
    details: `Issued prescription for diagnosis: ${parsed.data.diagnosis}`,
  });

  return { success: true, prescriptionId: newScript.id };
}

export async function addPatientAllergyAction(input: AddPatientAllergyInput) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = addPatientAllergySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid allergy data" };
  }

  const allergy = await addPatientAllergy(parsed.data);

  await logAuditAction({
    userId: session.user.id,
    action: "ADD_PATIENT_ALLERGY",
    resource: "patient_allergies",
    resourceId: allergy.id,
  });

  return { success: true, allergy };
}

export async function getPatientPrescriptionsAction(patientId?: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  let resolvedPatientId = patientId;

  if (session.user.role === "patient" || !resolvedPatientId) {
    const pat = await db.query.patients.findFirst({
      where: eq(patients.userId, session.user.id),
    });
    if (pat) {
      resolvedPatientId = pat.id;
    }
  }

  if (!resolvedPatientId) {
    return { success: true, prescriptions: [] };
  }

  const list = await getPatientPrescriptions(resolvedPatientId);
  return { success: true, prescriptions: list };
}

export async function getDoctorIssuedPrescriptionsAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "doctor") {
    return { error: "Unauthorized. Doctor role required." };
  }

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, session.user.id),
  });

  if (!doctor) return { error: "Doctor profile not found." };

  const list = await getDoctorIssuedPrescriptions(doctor.id);
  return { success: true, prescriptions: list };
}
