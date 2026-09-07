"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { patientProfileSchema } from "./patient.schema";
import { getPatientsForDoctor, getAllPatientsAdmin } from "./patient.service";
import { logAuditAction } from "@/lib/audit";

export async function updatePatientProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user) return { error: "Unauthorized" };

  const parsed = patientProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  await db
    .update(patients)
    .set({
      firstName: parsed.data.first_name,
      lastName: parsed.data.last_name,
      gender: parsed.data.gender,
      contactNumber: parsed.data.contact_number,
      address: parsed.data.address ?? null,
      updatedAt: new Date(),
    })
    .where(eq(patients.userId, session.user.id));

  await logAuditAction({
    userId: session.user.id,
    action: "UPDATE_PROFILE",
    resource: "patient",
    resourceId: session.user.id,
  });

  return { success: true };
}

export async function getDoctorPatientsList(userId: string) {
  return await getPatientsForDoctor(userId);
}

export async function getGlobalPatientsList() {
  return await getAllPatientsAdmin();
}
