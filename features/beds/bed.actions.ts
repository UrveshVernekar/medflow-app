"use server";

import { auth } from "@/lib/auth";
import { getAllWardsWithBeds, updateBedStatus } from "./bed.service";
import { logAuditAction } from "@/lib/audit";

export async function getWardsAndBedsAction() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const wards = await getAllWardsWithBeds();
  return { success: true, wards };
}

export async function updateBedStatusAction(
  bedId: string,
  status: "available" | "occupied" | "sanitizing" | "maintenance",
  assignedPatientId?: string | null
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "doctor")) {
    return { error: "Unauthorized. Admin or Doctor access required." };
  }

  const updatedBed = await updateBedStatus(bedId, status, assignedPatientId);

  await logAuditAction({
    userId: session.user.id,
    action: "UPDATE_BED_STATUS",
    resource: "beds",
    resourceId: bedId,
    details: `Updated bed status to ${status.toUpperCase()}`,
  });

  return { success: true, bed: updatedBed };
}
