import { db } from "@/lib/db";
import type { AvailabilitySlot } from "./doctor-availability.types";

export async function getDoctorAvailability(userId: string) {
  const doctorResult = await db`
    SELECT id FROM medflow.doctors 
    WHERE user_id = ${userId} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (doctorResult.length === 0) {
    throw new Error("Doctor profile not found");
  }

  const doctorId = doctorResult[0].id;

  const result = await db`
    SELECT day_of_week, start_time, end_time 
    FROM medflow.doctor_availability 
    WHERE doctor_id = ${doctorId} 
    ORDER BY day_of_week
  `;

  const slots: AvailabilitySlot[] = result.map((row: any) => ({
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
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

  // Get doctor_id
  const doctorResult = await db`
    SELECT id FROM medflow.doctors 
    WHERE user_id = ${userId} AND deleted_at IS NULL
    LIMIT 1
  `;

  if (doctorResult.length === 0) {
    throw new Error(
      "Doctor profile not found. Please ask Admin to create your doctor profile.",
    );
  }

  const doctorId = doctorResult[0].id;

  // Delete old slots
  await db`
    DELETE FROM medflow.doctor_availability 
    WHERE doctor_id = ${doctorId}
  `;

  if (slots.length === 0) {
    return { success: true };
  }

  // Build dynamic insert
  const valuePlaceholders = slots
    .map((_, i) => {
      const offset = i * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    })
    .join(", ");

  const params: any[] = [];
  slots.forEach((slot) => {
    params.push(doctorId, slot.dayOfWeek, slot.startTime, slot.endTime);
  });

  // Execute insert
  await db.unsafe(
    `
    INSERT INTO medflow.doctor_availability 
      (doctor_id, day_of_week, start_time, end_time)
    VALUES ${valuePlaceholders}
  `,
    params,
  );

  return { success: true };
}
