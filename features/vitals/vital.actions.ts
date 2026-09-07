"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { recordVitalSignsSchema, RecordVitalSignsInput } from "./vital.schema";
import { recordVitalSigns, getPatientVitalsHistory } from "./vital.service";
import { logAuditAction } from "@/lib/audit";

export async function recordVitalSignsAction(input: RecordVitalSignsInput) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "doctor" && session.user.role !== "admin")) {
    return { error: "Unauthorized. Doctor or Admin permission required." };
  }

  const parsed = recordVitalSignsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid vital signs data", details: parsed.error.format() };
  }

  const newVitals = await recordVitalSigns(session.user.id, parsed.data);

  await logAuditAction({
    userId: session.user.id,
    action: "RECORD_VITAL_SIGNS",
    resource: "vital_signs",
    resourceId: newVitals.id,
    details: `BP: ${parsed.data.bloodPressureSystolic}/${parsed.data.bloodPressureDiastolic}, HR: ${parsed.data.heartRate}, SpO2: ${parsed.data.spO2}%`,
  });

  return { success: true, vitals: newVitals };
}

export async function getPatientVitalsHistoryAction(patientId?: string) {
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
    return { success: true, history: [] };
  }

  const history = await getPatientVitalsHistory(resolvedPatientId);
  return { success: true, history };
}
