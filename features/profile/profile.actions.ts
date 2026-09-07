"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, doctors, patients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAuditAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getUserProfileData() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  let doctorProfile = null;
  let patientProfile = null;

  if (user.role === "doctor") {
    doctorProfile = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
      with: {
        department: true,
      },
    });
  } else if (user.role === "patient") {
    patientProfile = await db.query.patients.findFirst({
      where: eq(patients.userId, userId),
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      createdAt: user.createdAt,
    },
    doctor: doctorProfile
      ? {
          id: doctorProfile.id,
          specialization: doctorProfile.specialization,
          licenseNumber: doctorProfile.licenseNumber || "",
          yearsOfExperience: doctorProfile.yearsOfExperience || 0,
          departmentName: doctorProfile.department?.name || "General",
        }
      : null,
    patient: patientProfile
      ? {
          id: patientProfile.id,
          gender: patientProfile.gender || "",
          contactNumber: patientProfile.contactNumber || "",
          address: patientProfile.address || "",
        }
      : null,
  };
}

export async function updateUserProfileDetailsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const userId = session.user.id;
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const contactNumber = formData.get("contactNumber") as string;
  const address = formData.get("address") as string;

  // 1. Update user names
  await db
    .update(users)
    .set({
      firstName,
      lastName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // 2. Update patient profile if role === patient
  if (session.user.role === "patient") {
    await db
      .update(patients)
      .set({
        firstName,
        lastName,
        contactNumber: contactNumber || null,
        address: address || null,
        updatedAt: new Date(),
      })
      .where(eq(patients.userId, userId));
  }

  await logAuditAction({
    userId,
    action: "UPDATE_MY_PROFILE",
    resource: "users",
    resourceId: userId,
  });

  revalidatePath("/profile");
  return { success: true };
}
