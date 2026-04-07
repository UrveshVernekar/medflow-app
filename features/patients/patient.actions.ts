"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { patientProfileSchema } from "./patient.schema";
import { getPatientsForDoctor, getAllPatientsAdmin } from "./patient.service";

export async function updatePatientProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user) return { error: "Unauthorized" };

  const parsed = patientProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  await db`
    UPDATE medflow.patients
    SET
      first_name = ${parsed.data.first_name},
      last_name = ${parsed.data.last_name},
      gender = ${parsed.data.gender},
      contact_number = ${parsed.data.contact_number},
      address = ${parsed.data.address ?? null},
      updated_at = now()
    WHERE user_id = ${session.user.id}
  `;

  return { success: true };
}

export async function getDoctorPatientsList(userId: string) {
  return await getPatientsForDoctor(userId);
}

export async function getGlobalPatientsList() {
  return await getAllPatientsAdmin();
}
