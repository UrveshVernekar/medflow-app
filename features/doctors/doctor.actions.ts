"use server";

import { createDoctorSchema } from "./doctor.schema";
import { createUser } from "@/features/auth/auth.service";
import { createDoctorProfile } from "./doctor.service";
import { auth } from "@/lib/auth";

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

  const user = await createUser(email, password, "doctor");

  await createDoctorProfile(user.id, {
    specialization,
    license_number,
    years_of_experience,
    department_id,
  });

  return { success: true };
}
