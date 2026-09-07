"use server";

import { createDoctorSchema } from "./doctor.schema";
import { createUser } from "@/features/auth/auth.service";
import { createDoctorProfile } from "./doctor.service";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

export async function createDoctorAction(formData: FormData) {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const parsed = createDoctorSchema.safeParse({
    ...Object.fromEntries(formData),
    years_of_experience: Number(formData.get("years_of_experience")),
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const {
    email,
    password,
    specialization,
    license_number,
    years_of_experience,
    department_id,
  } = parsed.data;

  const result = await db.transaction(async (tx) => {
    const user = await createUser(email, password, "doctor");

    const doctor = await createDoctorProfile(
      user.id,
      {
        specialization,
        license_number,
        years_of_experience,
        department_id,
      },
      tx,
    );

    return { user, doctor };
  });

  await logAuditAction({
    userId: session.user.id,
    action: "CREATE_DOCTOR",
    resource: "doctors",
    resourceId: result.doctor.id,
    details: `Admin created doctor profile for ${email}`,
  });

  return { success: true };
}
