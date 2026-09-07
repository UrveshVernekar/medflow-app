import { z } from "zod";

export const recordVitalSignsSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  bloodPressureSystolic: z.number().min(50).max(250),
  bloodPressureDiastolic: z.number().min(30).max(150),
  heartRate: z.number().min(30).max(220),
  spO2: z.number().min(50).max(100),
  temperatureCelsius: z.number().min(30).max(45),
  respiratoryRate: z.number().optional(),
  weightKg: z.number().optional(),
  heightCm: z.number().optional(),
});

export type RecordVitalSignsInput = z.infer<typeof recordVitalSignsSchema>;
