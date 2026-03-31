"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { availabilitySchema } from "./doctor-availability.schema";
import {
  upsertDoctorAvailability,
  getDoctorAvailability,
} from "./doctor-availability.service";
import type { AvailabilitySlot } from "./doctor-availability.types";

type ActionState = {
  success?: boolean;
  error?: string;
  slots?: AvailabilitySlot[];
};

export async function getMyAvailabilityAction(): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "doctor") {
    return { error: "Unauthorized" };
  }

  try {
    const data = await getDoctorAvailability(session.user.id);
    return { success: true, slots: data.slots };
  } catch (error: any) {
    console.error("getMyAvailabilityAction ERROR:", error.message);
    return { error: error.message || "Failed to fetch availability" };
  }
}

// features/doctors/doctor-availability.actions.ts
export async function updateAvailabilityAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "doctor") {
    return { error: "Unauthorized" };
  }

  try {
    const slotsString = formData.get("slots") as string;

    if (!slotsString) {
      return { error: "No slots data received" };
    }

    let rawSlots = JSON.parse(slotsString);

    // === IMPORTANT FIX: Normalize time format (remove seconds if present) ===
    const normalizedSlots = rawSlots.map((slot: any) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.split(":").slice(0, 2).join(":"), // "09:00:00" → "09:00"
      endTime: slot.endTime.split(":").slice(0, 2).join(":"), // "17:00:00" → "17:00"
    }));

    // Validate the normalized data
    const validated = availabilitySchema.safeParse({ slots: normalizedSlots });
    if (!validated.success) {
      return {
        error: validated.error.issues[0]?.message || "Validation error",
      };
    }

    // Call service
    await upsertDoctorAvailability(session.user.id, validated.data.slots);

    revalidatePath("/doctor/availability");

    return { success: true };
  } catch (error: any) {
    return {
      error:
        error.message || "Failed to update availability. Please try again.",
    };
  }
}
