"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { departmentSchema } from "./department.schema";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./department.service";

export async function createDepartmentAction(formData: FormData) {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const parsed = departmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  await createDepartment(parsed.data.name, parsed.data.description);
  revalidatePath("/admin/departments");
  return { success: true, department: { name: parsed.data.name } };
}

export async function deleteDepartmentAction(id: string) {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await deleteDepartment(id);
  revalidatePath("/admin/departments");
  return { success: true };
}
