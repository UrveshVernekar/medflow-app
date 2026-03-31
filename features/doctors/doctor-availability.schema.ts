import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/; // Allow optional :ss

export const availabilitySlotSchema = z
  .object({
    dayOfWeek: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  })
  .refine(
    (data) => {
      // Normalize times by removing seconds if present
      const normalizeTime = (time: string) =>
        time.split(":").slice(0, 2).join(":");

      const start = normalizeTime(data.startTime);
      const end = normalizeTime(data.endTime);

      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);

      return endHour * 60 + endMin > startHour * 60 + startMin + 10;
    },
    {
      message: "End time must be at least 10 minutes after start time",
      path: ["endTime"],
    },
  );

export const availabilitySchema = z.object({
  slots: z
    .array(availabilitySlotSchema)
    .min(1, "At least one availability day is required")
    .max(7, "Maximum 7 days allowed"),
});

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
