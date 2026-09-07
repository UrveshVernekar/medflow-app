import { db } from "@/lib/db";
import { doctors, doctorAvailability } from "@/lib/db/schema";
import { eq, isNull, and, asc } from "drizzle-orm";
import type { AvailabilitySlot } from "./doctor-availability.types";

export async function getDoctorAvailability(userId: string) {
  const doctorResult = await db
    .select({ id: doctors.id })
    .from(doctors)
    .where(and(eq(doctors.userId, userId), isNull(doctors.deletedAt)))
    .limit(1);

  if (doctorResult.length === 0) {
    throw new Error("Doctor profile not found");
  }

  const doctorId = doctorResult[0].id;

  const result = await db
    .select({
      dayOfWeek: doctorAvailability.dayOfWeek,
      startTime: doctorAvailability.startTime,
      endTime: doctorAvailability.endTime,
    })
    .from(doctorAvailability)
    .where(eq(doctorAvailability.doctorId, doctorId))
    .orderBy(asc(doctorAvailability.dayOfWeek));

  const slots: AvailabilitySlot[] = result.map((row) => ({
    dayOfWeek: row.dayOfWeek as AvailabilitySlot["dayOfWeek"],
    startTime: row.startTime,
    endTime: row.endTime,
  }));

  return { slots };
}

export async function upsertDoctorAvailability(
  userId: string,
  slots: AvailabilitySlot[],
) {
  if (!slots || !Array.isArray(slots)) {
    throw new Error("Invalid slots data received");
  }

  return await db.transaction(async (tx) => {
    const doctorResult = await tx
      .select({ id: doctors.id })
      .from(doctors)
      .where(and(eq(doctors.userId, userId), isNull(doctors.deletedAt)))
      .limit(1);

    if (doctorResult.length === 0) {
      throw new Error(
        "Doctor profile not found. Please ask Admin to create your doctor profile.",
      );
    }

    const doctorId = doctorResult[0].id;

    // Delete old slots inside transaction
    await tx
      .delete(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, doctorId));

    if (slots.length === 0) {
      return { success: true };
    }

    // Bulk insert new slots
    await tx.insert(doctorAvailability).values(
      slots.map((slot) => ({
        doctorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    );

    return { success: true };
  });
}
