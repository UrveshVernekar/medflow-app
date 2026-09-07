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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch availability";
    console.error("getMyAvailabilityAction ERROR:", message);
    return { error: message };
  }
}

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

    const rawSlots: AvailabilitySlot[] = JSON.parse(slotsString);

    // Normalize time format (remove seconds if present)
    const normalizedSlots = rawSlots.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: String(slot.startTime).split(":").slice(0, 2).join(":"),
      endTime: String(slot.endTime).split(":").slice(0, 2).join(":"),
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update availability. Please try again.";
    return { error: message };
  }
}
