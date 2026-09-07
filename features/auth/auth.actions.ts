"use server";

import { loginSchema, registerSchema } from "./auth.schema";
import { createUser, getUserByEmail } from "./auth.service";
import { signIn, signOut } from "@/lib/auth";
import { createPatientProfile } from "@/features/patients/patient.service";
import { db } from "@/lib/db";
import { logAuditAction } from "@/lib/audit";

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

  const user = await db.transaction(async (tx) => {
    const newUser = await createUser(email, password, role);

    if (role === "patient") {
      await createPatientProfile(newUser.id, tx);
    }

    return newUser;
  });

  await logAuditAction({
    userId: user.id,
    action: "USER_REGISTERED",
    resource: "users",
    resourceId: user.id,
    details: `User registered with role ${role}`,
  });

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
  } catch (error: unknown) {
    const err = error as { name?: string; type?: string; message?: string };
    if (err?.name === "AuthError" || err?.type) {
      return { error: "Invalid email or password" };
    }

    if (err?.message?.includes("CredentialsSignin")) {
      return { error: "Invalid email or password" };
    }

    throw error;
  }

  const user = await getUserByEmail(email);

  if (!user?.role) {
    return { error: "Failed to get user role" };
  }

  await logAuditAction({
    userId: user.id,
    action: "USER_LOGIN",
    resource: "users",
    resourceId: user.id,
  });

  return {
    success: true,
    role: user.role as "admin" | "doctor" | "patient",
  };
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/login",
  });
}
