"use server";

import { loginSchema, registerSchema } from "./auth.schema";
import { createUser, getUserByEmail } from "./auth.service";
import { signIn } from "@/lib/auth";
import { createPatientProfile } from "@/features/patients/patient.service";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { email, password, role } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "User already exists" };
  }

  const user = await createUser(email, password, role);

  // ✅ AUTO CREATE PATIENT PROFILE
  if (role === "patient") {
    await createPatientProfile(user.id);
  }

  return {
    success: true,
    user,
  };
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Invalid credentials" };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error: any) {
    if (error?.name === "AuthError" || error?.type) {
      return { error: "Invalid email or password" };
    }

    if (error?.message?.includes("CredentialsSignin")) {
      return { error: "Invalid email or password" };
    }

    throw error;
  }

  const user = await getUserByEmail(email);

  if (!user?.role) {
    return { error: "Failed to get user role" };
  }

  return {
    success: true,
    role: user.role as "admin" | "doctor" | "patient",
  };
}
