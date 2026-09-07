import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().min(1, "Patient ID is required"),
  diagnosis: z.string().min(3, "Diagnosis is required"),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medication is required"),
});

export const addPatientAllergySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  allergen: z.string().min(2, "Allergen name is required"),
  severity: z.enum(["mild", "moderate", "severe", "anaphylactic"]).default("moderate"),
  reaction: z.string().optional(),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type AddPatientAllergyInput = z.infer<typeof addPatientAllergySchema>;
